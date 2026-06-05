import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import {
  ComplianceCheck,
  ComplianceFramework,
  ComplianceStatus,
} from "./compliance-check.entity";

@Injectable()
export class ComplianceService {
  constructor(
    @InjectRepository(ComplianceCheck)
    private complianceRepo: Repository<ComplianceCheck>,
  ) {}

  async create(data: Partial<ComplianceCheck>): Promise<ComplianceCheck> {
    this.assertFrameworkEvidenceRules(data);
    const check = this.complianceRepo.create(data);
    return this.complianceRepo.save(check);
  }

  async findAll(tenantId: string, framework?: ComplianceFramework) {
    const where: any = { tenantId };
    if (framework) where.framework = framework;
    return this.complianceRepo.find({ where, order: { controlId: "ASC" } });
  }

  async findOne(id: string, tenantId: string) {
    return this.complianceRepo.findOne({ where: { id, tenantId } });
  }

  async update(id: string, tenantId: string, data: Partial<ComplianceCheck>) {
    const current = await this.findOne(id, tenantId);
    this.assertFrameworkEvidenceRules({ ...current, ...data });
    await this.complianceRepo.update({ id, tenantId }, data);
    return this.findOne(id, tenantId);
  }

  async remove(id: string, tenantId: string) {
    await this.complianceRepo.delete({ id, tenantId });
    return { deleted: true };
  }

  async getSummary(tenantId: string) {
    const checks = await this.complianceRepo.find({ where: { tenantId } });
    const frameworks = Object.values(ComplianceFramework);

    return frameworks.map((framework) => {
      const frameworkChecks = checks.filter((c) => c.framework === framework);
      const compliant = frameworkChecks.filter(
        (c) => c.status === ComplianceStatus.COMPLIANT,
      ).length;
      const total = frameworkChecks.length;
      const percentage = total > 0 ? Math.round((compliant / total) * 100) : 0;

      return {
        framework,
        total,
        compliant,
        nonCompliant: frameworkChecks.filter(
          (c) => c.status === ComplianceStatus.NON_COMPLIANT,
        ).length,
        partial: frameworkChecks.filter(
          (c) => c.status === ComplianceStatus.PARTIAL,
        ).length,
        notApplicable: frameworkChecks.filter(
          (c) => c.status === ComplianceStatus.NOT_APPLICABLE,
        ).length,
        percentage,
      };
    });
  }

  private assertFrameworkEvidenceRules(check: Partial<ComplianceCheck>) {
    if (
      check.framework === ComplianceFramework.ISO27001 &&
      check.status === ComplianceStatus.NON_COMPLIANT &&
      !check.evidence?.trim()
    ) {
      throw new BadRequestException(
        "ISO 27001 non-compliant controls require evidence describing the gap or corrective action.",
      );
    }
  }
}
