import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { VulnerabilitiesService } from "./vulnerabilities.service";
import { VulnSeverity, VulnStatus } from "./vulnerability.entity";

@Controller("vulnerabilities")
@UseGuards(JwtAuthGuard)
export class VulnerabilitiesController {
  constructor(private vulnsService: VulnerabilitiesService) {}

  @Post()
  create(@Body() body: any, @CurrentUser("tenantId") tenantId: string) {
    return this.vulnsService.create({ ...body, tenantId });
  }

  @Get()
  findAll(
    @CurrentUser("tenantId") tenantId: string,
    @Query("severity") severity?: VulnSeverity,
    @Query("status") status?: VulnStatus
  ) {
    return this.vulnsService.findAll(tenantId, { severity, status });
  }

  @Get("stats")
  getStats(@CurrentUser("tenantId") tenantId: string) {
    return this.vulnsService.getStats(tenantId);
  }

  @Get(":id")
  findOne(@Param("id") id: string, @CurrentUser("tenantId") tenantId: string) {
    return this.vulnsService.findOne(id, tenantId);
  }

  @Put(":id")
  update(
    @Param("id") id: string,
    @Body() body: any,
    @CurrentUser("tenantId") tenantId: string
  ) {
    return this.vulnsService.update(id, tenantId, body);
  }

  @Delete(":id")
  remove(@Param("id") id: string, @CurrentUser("tenantId") tenantId: string) {
    return this.vulnsService.remove(id, tenantId);
  }
}
