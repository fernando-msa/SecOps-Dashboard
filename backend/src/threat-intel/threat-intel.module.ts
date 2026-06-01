import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ThreatIntelService } from "./threat-intel.service";
import { ThreatIntelController } from "./threat-intel.controller";

@Module({
  imports: [ConfigModule],
  providers: [ThreatIntelService],
  controllers: [ThreatIntelController],
})
export class ThreatIntelModule {}
