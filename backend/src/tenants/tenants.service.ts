import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Tenant } from "./tenant.entity";

@Injectable()
export class TenantsService {
  constructor(
    @InjectRepository(Tenant)
    private tenantsRepo: Repository<Tenant>
  ) {}

  async create(data: { name: string; slug: string }): Promise<Tenant> {
    const tenant = this.tenantsRepo.create(data);
    return this.tenantsRepo.save(tenant);
  }

  async findById(id: string): Promise<Tenant | null> {
    return this.tenantsRepo.findOne({ where: { id } });
  }
}
