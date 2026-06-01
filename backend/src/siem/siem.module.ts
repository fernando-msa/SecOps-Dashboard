import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { SecurityEvent } from "../security-events/security-event.entity";
import { SiemService } from "./siem.service";
import { SiemController } from "./siem.controller";

@Module({
  imports: [TypeOrmModule.forFeature([SecurityEvent])],
  providers: [SiemService],
  controllers: [SiemController],
})
export class SiemModule {}
