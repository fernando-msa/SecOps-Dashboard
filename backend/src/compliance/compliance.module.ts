import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ComplianceCheck } from "./compliance-check.entity";
import { ComplianceService } from "./compliance.service";
import { ComplianceController } from "./compliance.controller";

@Module({
  imports: [TypeOrmModule.forFeature([ComplianceCheck])],
  providers: [ComplianceService],
  controllers: [ComplianceController],
  exports: [ComplianceService],
})
export class ComplianceModule {}
