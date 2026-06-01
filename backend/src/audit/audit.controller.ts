import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { AuditService } from "./audit.service";

@Controller("audit")
@UseGuards(JwtAuthGuard)
export class AuditController {
  constructor(private auditService: AuditService) {}

  @Get()
  findAll(
    @CurrentUser("tenantId") tenantId: string,
    @Query("userId") userId?: string,
    @Query("action") action?: string,
    @Query("resource") resource?: string
  ) {
    return this.auditService.findAll(tenantId, { userId, action, resource });
  }

  @Get("stats")
  getStats(@CurrentUser("tenantId") tenantId: string) {
    return this.auditService.getStats(tenantId);
  }
}
