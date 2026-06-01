import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Vulnerability } from "./vulnerability.entity";
import { VulnerabilitiesService } from "./vulnerabilities.service";
import { VulnerabilitiesController } from "./vulnerabilities.controller";

@Module({
  imports: [TypeOrmModule.forFeature([Vulnerability])],
  providers: [VulnerabilitiesService],
  controllers: [VulnerabilitiesController],
  exports: [VulnerabilitiesService],
})
export class VulnerabilitiesModule {}
