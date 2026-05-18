import { Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { writeFile, readFile, unlink, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly uploadDir: string;

  constructor() {
    this.uploadDir = process.env.UPLOAD_DIR || join(process.cwd(), 'uploads');
    if (!existsSync(this.uploadDir)) {
      existsSync(this.uploadDir);
    }
  }

  async uploadFile(
    bucket: string,
    key: string,
    buffer: Buffer,
    contentType: string,
  ): Promise<string> {
    const dir = join(this.uploadDir, bucket);
    if (!existsSync(dir)) {
      await mkdir(dir, { recursive: true });
    }
    const fullPath = join(dir, key);
    await writeFile(fullPath, buffer);
    this.logger.log(`Uploaded ${key} to local storage (${contentType})`);
    return fullPath;
  }

  async getFile(bucket: string, key: string): Promise<Buffer | null> {
    try {
      const fullPath = join(this.uploadDir, bucket, key);
      return await readFile(fullPath);
    } catch {
      this.logger.warn(`File not found: ${bucket}/${key}`);
      return null;
    }
  }

  async deleteFile(bucket: string, key: string): Promise<void> {
    try {
      const fullPath = join(this.uploadDir, bucket, key);
      await unlink(fullPath);
    } catch {
      this.logger.warn(`Failed to delete: ${bucket}/${key}`);
    }
  }

  generateKey(orgId: string, filename: string): string {
    const sanitized = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
    return `${orgId}/${Date.now()}-${randomUUID().slice(0, 8)}-${sanitized}`;
  }

  getPublicUrl(bucket: string, key: string): string {
    return `/api/v1/files/${bucket}/${key}`;
  }
}
