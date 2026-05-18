import { Injectable, Logger, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { EncryptionService } from '../../common/encryption/encryption.service';

const SUPPORTED_PROVIDERS = ['openai', 'anthropic', 'google', 'azure_openai', 'custom'] as const;
export type ApiKeyProvider = (typeof SUPPORTED_PROVIDERS)[number];

@Injectable()
export class ByokService {
  private readonly logger = new Logger(ByokService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly encryption: EncryptionService,
  ) {}

  async setKey(organizationId: string, provider: ApiKeyProvider, key: string) {
    if (!SUPPORTED_PROVIDERS.includes(provider)) {
      throw new Error(`Unsupported provider: ${provider}. Supported: ${SUPPORTED_PROVIDERS.join(', ')}`);
    }
    const keyEncrypted = this.encryption.encrypt(key);
    const keyPrefix = this.encryption.maskKey(key);

    const exists = await this.prisma.tenantApiKey.findUnique({
      where: { organizationId_provider: { organizationId, provider } },
    });

    if (exists) {
      return this.prisma.tenantApiKey.update({
        where: { id: exists.id },
        data: { keyEncrypted, keyPrefix, isActive: true },
        select: { id: true, provider: true, keyPrefix: true, isActive: true, createdAt: true, updatedAt: true },
      });
    }

    return this.prisma.tenantApiKey.create({
      data: { organizationId, provider, keyEncrypted, keyPrefix },
      select: { id: true, provider: true, keyPrefix: true, isActive: true, createdAt: true, updatedAt: true },
    });
  }

  async getKeys(organizationId: string) {
    const keys = await this.prisma.tenantApiKey.findMany({
      where: { organizationId },
      select: { id: true, provider: true, keyPrefix: true, isActive: true, createdAt: true, updatedAt: true },
      orderBy: { createdAt: 'desc' },
    });
    return keys;
  }

  async getDecryptedKey(organizationId: string, provider: ApiKeyProvider): Promise<string | null> {
    const record = await this.prisma.tenantApiKey.findUnique({
      where: { organizationId_provider: { organizationId, provider }, isActive: true },
    });
    if (!record) return null;
    try {
      return this.encryption.decrypt(record.keyEncrypted);
    } catch (err) {
      this.logger.error(`Failed to decrypt key for org ${organizationId}, provider ${provider}: ${err}`);
      return null;
    }
  }

  async deleteKey(organizationId: string, provider: ApiKeyProvider) {
    const record = await this.prisma.tenantApiKey.findUnique({
      where: { organizationId_provider: { organizationId, provider } },
    });
    if (!record) throw new NotFoundException(`No API key found for provider: ${provider}`);
    await this.prisma.tenantApiKey.delete({ where: { id: record.id } });
    return { deleted: true, provider };
  }

  async toggleKey(organizationId: string, provider: ApiKeyProvider, isActive: boolean) {
    const record = await this.prisma.tenantApiKey.findUnique({
      where: { organizationId_provider: { organizationId, provider } },
    });
    if (!record) throw new NotFoundException(`No API key found for provider: ${provider}`);
    return this.prisma.tenantApiKey.update({
      where: { id: record.id },
      data: { isActive },
      select: { id: true, provider: true, keyPrefix: true, isActive: true },
    });
  }

  async getDefaultKey(organizationId: string): Promise<string | null> {
    // Try OpenAI first, then any active key
    const openaiKey = await this.getDecryptedKey(organizationId, 'openai');
    if (openaiKey) return openaiKey;

    const keys = await this.prisma.tenantApiKey.findMany({
      where: { organizationId, isActive: true },
      orderBy: { createdAt: 'asc' },
    });
    for (const key of keys) {
      try {
        return this.encryption.decrypt(key.keyEncrypted);
      } catch { continue; }
    }
    return null;
  }
}
