import { Injectable, UnauthorizedException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ApiKey } from "./apikey.entity";
import * as crypto from "crypto";

@Injectable()
export class ApiKeysService {
  constructor(
    @InjectRepository(ApiKey)
    private apiKeysRepo: Repository<ApiKey>
  ) {}

  async create(name: string, permissions: string[], tenantId: string) {
    const key = `secops_${crypto.randomBytes(32).toString("hex")}`;
    const apiKey = this.apiKeysRepo.create({ name, key, permissions, tenantId });
    const saved = await this.apiKeysRepo.save(apiKey);
    return saved; // Return full key only on creation
  }

  async findAll(tenantId: string) {
    const keys = await this.apiKeysRepo.find({
      where: { tenantId },
      order: { createdAt: "DESC" },
    });
    // Mask keys for display
    return keys.map((k) => ({
      ...k,
      key: k.key.substring(0, 12) + "..." + k.key.substring(k.key.length - 4),
    }));
  }

  async validate(key: string): Promise<ApiKey | null> {
    const apiKey = await this.apiKeysRepo.findOne({ where: { key, isActive: true } });
    if (!apiKey) return null;

    apiKey.lastUsedAt = new Date();
    await this.apiKeysRepo.save(apiKey);
    return apiKey;
  }

  async revoke(id: string, tenantId: string) {
    await this.apiKeysRepo.update({ id, tenantId }, { isActive: false });
    return { revoked: true };
  }

  async activate(id: string, tenantId: string) {
    await this.apiKeysRepo.update({ id, tenantId }, { isActive: true });
    return { activated: true };
  }

  async remove(id: string, tenantId: string) {
    await this.apiKeysRepo.delete({ id, tenantId });
    return { deleted: true };
  }
}
