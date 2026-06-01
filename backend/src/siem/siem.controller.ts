import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  HttpCode,
} from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { SiemService, RawLog } from "./siem.service";

@Controller("siem")
@UseGuards(JwtAuthGuard)
export class SiemController {
  constructor(private siemService: SiemService) {}

  @Post("ingest")
  @HttpCode(200)
  ingest(
    @Body() body: { logs: RawLog[] },
    @CurrentUser("tenantId") tenantId: string
  ) {
    return this.siemService.ingestLogs(body.logs, tenantId);
  }

  @Post("ingest/single")
  ingestSingle(
    @Body() body: RawLog,
    @CurrentUser("tenantId") tenantId: string
  ) {
    return this.siemService.ingestLogs([body], tenantId);
  }

  @Get("stats")
  getStats(@CurrentUser("tenantId") tenantId: string) {
    return this.siemService.getIngestionStats(tenantId);
  }
}
