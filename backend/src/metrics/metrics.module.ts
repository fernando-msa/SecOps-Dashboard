import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { SecurityEvent } from "../security-events/security-event.entity";
import { Vulnerability } from "../vulnerabilities/vulnerability.entity";
import { ComplianceCheck } from "../compliance/compliance-check.entity";
import { MetricsService } from "./metrics.service";
import { MetricsController } from "./metrics.controller";

@Module({
  imports: [TypeOrmModule.forFeature([SecurityEvent, Vulnerability, ComplianceCheck])],
  providers: [MetricsService],
  controllers: [MetricsController],
})
export class MetricsModule {}
