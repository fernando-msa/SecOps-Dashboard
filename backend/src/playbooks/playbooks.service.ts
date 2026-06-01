import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Playbook } from "./playbook.entity";

@Injectable()
export class PlaybooksService {
  constructor(
    @InjectRepository(Playbook)
    private playbooksRepo: Repository<Playbook>
  ) {}

  async create(data: Partial<Playbook>): Promise<Playbook> {
    const playbook = this.playbooksRepo.create(data);
    return this.playbooksRepo.save(playbook);
  }

  async findAll(tenantId: string) {
    return this.playbooksRepo.find({ where: { tenantId }, order: { createdAt: "DESC" } });
  }

  async findOne(id: string, tenantId: string) {
    return this.playbooksRepo.findOne({ where: { id, tenantId } });
  }

  async update(id: string, tenantId: string, data: Partial<Playbook>) {
    await this.playbooksRepo.update({ id, tenantId }, data);
    return this.findOne(id, tenantId);
  }

  async remove(id: string, tenantId: string) {
    await this.playbooksRepo.delete({ id, tenantId });
    return { deleted: true };
  }

  async toggleActive(id: string, tenantId: string) {
    const playbook = await this.findOne(id, tenantId);
    if (!playbook) return null;
    playbook.isActive = !playbook.isActive;
    return this.playbooksRepo.save(playbook);
  }
}
