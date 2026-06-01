import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { SecurityEvent } from "../security-events/security-event.entity";
import { Vulnerability } from "../vulnerabilities/vulnerability.entity";
import { Incident } from "../incidents/incident.entity";
import { Asset } from "../assets/asset.entity";
import { ComplianceCheck } from "../compliance/compliance-check.entity";
import { ExportService } from "./export.service";
import { ExportController } from "./export.controller";

@Module({
  imports: [TypeOrmModule.forFeature([SecurityEvent, Vulnerability, Incident, Asset, ComplianceCheck])],
  providers: [ExportService],
  controllers: [ExportController],
})
export class ExportModule {}
