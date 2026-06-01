import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Asset, AssetType, AssetCriticality } from "./asset.entity";

@Injectable()
export class AssetsService {
  constructor(
    @InjectRepository(Asset)
    private assetsRepo: Repository<Asset>
  ) {}

  async create(data: Partial<Asset>): Promise<Asset> {
    const asset = this.assetsRepo.create(data);
    return this.assetsRepo.save(asset);
  }

  async findAll(tenantId: string, filters?: { type?: AssetType; criticality?: AssetCriticality; status?: string }) {
    const where: any = { tenantId };
    if (filters?.type) where.type = filters.type;
    if (filters?.criticality) where.criticality = filters.criticality;
    if (filters?.status) where.status = filters.status;
    return this.assetsRepo.find({ where, order: { createdAt: "DESC" } });
  }

  async findOne(id: string, tenantId: string) {
    return this.assetsRepo.findOne({ where: { id, tenantId } });
  }

  async update(id: string, tenantId: string, data: Partial<Asset>) {
    await this.assetsRepo.update({ id, tenantId }, data);
    return this.findOne(id, tenantId);
  }

  async remove(id: string, tenantId: string) {
    await this.assetsRepo.delete({ id, tenantId });
    return { deleted: true };
  }

  async getStats(tenantId: string) {
    const assets = await this.assetsRepo.find({ where: { tenantId } });
    const byType: Record<string, number> = {};
    const byCriticality: Record<string, number> = {};
    let active = 0;
    let inactive = 0;

    for (const asset of assets) {
      byType[asset.type] = (byType[asset.type] || 0) + 1;
      byCriticality[asset.criticality] = (byCriticality[asset.criticality] || 0) + 1;
      if (asset.status === "active") active++;
      else inactive++;
    }

    return { total: assets.length, active, inactive, byType, byCriticality };
  }
}
