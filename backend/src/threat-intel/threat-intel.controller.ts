import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
} from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { ThreatIntelService } from "./threat-intel.service";

@Controller("threat-intel")
@UseGuards(JwtAuthGuard)
export class ThreatIntelController {
  constructor(private threatIntelService: ThreatIntelService) {}

  @Get("lookup/ip")
  lookupIP(@Query("ip") ip: string) {
    return this.threatIntelService.lookupIP(ip);
  }

  @Get("lookup/domain")
  lookupDomain(@Query("domain") domain: string) {
    return this.threatIntelService.lookupDomain(domain);
  }

  @Get("lookup/hash")
  lookupHash(@Query("hash") hash: string) {
    return this.threatIntelService.lookupHash(hash);
  }

  @Post("enrich")
  enrichEvent(
    @Body() body: { source?: string; description?: string; title?: string }
  ) {
    return this.threatIntelService.enrichEvent(body);
  }

  @Get("config")
  getConfig() {
    return this.threatIntelService.getConfigStatus();
  }
}
