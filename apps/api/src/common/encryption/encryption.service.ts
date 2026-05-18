import { Injectable, Logger } from '@nestjs/common';
import * as crypto from 'node:crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const TAG_LENGTH = 16;
const SALT_LENGTH = 32;
const KEY_LENGTH = 32;
const ITERATIONS = 600000;
const DIGEST = 'sha512';

function getMasterKey(): Buffer {
  const key = process.env.BYOK_ENCRYPTION_KEY;
  if (!key) {
    throw new Error('BYOK_ENCRYPTION_KEY environment variable is required');
  }
  // Accept both hex-encoded 64-char (32 bytes) and raw passphrases
  if (key.length === 64 && /^[0-9a-fA-F]{64}$/.test(key)) {
    return Buffer.from(key, 'hex');
  }
  // Use PBKDF2 for passphrase-based keys
  const salt = crypto.createHash('sha256').update('procura-byok-v1-' + key.slice(0, 4)).digest().slice(0, 16);
  return crypto.pbkdf2Sync(key, salt, ITERATIONS, KEY_LENGTH, DIGEST);
}

@Injectable()
export class EncryptionService {
  private readonly logger = new Logger(EncryptionService.name);
  private readonly key: Buffer;

  constructor() {
    this.key = getMasterKey();
  }

  encrypt(plaintext: string): string {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, this.key, iv);
    let encrypted = cipher.update(plaintext, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag().toString('hex');
    return `${iv.toString('hex')}:${authTag}:${encrypted}`;
  }

  decrypt(encoded: string): string {
    const parts = encoded.split(':');
    if (parts.length !== 3) {
      throw new Error('Invalid encrypted format');
    }
    const iv = Buffer.from(parts[0], 'hex');
    const authTag = Buffer.from(parts[1], 'hex');
    const encrypted = parts[2];
    const decipher = crypto.createDecipheriv(ALGORITHM, this.key, iv);
    decipher.setAuthTag(authTag);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  maskKey(key: string): string {
    if (key.length <= 8) return '***';
    return key.slice(0, 8) + '...' + key.slice(-4);
  }
}
