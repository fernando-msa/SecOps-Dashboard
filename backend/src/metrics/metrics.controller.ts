import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { MetricsService } from "./metrics.service";

@Controller("metrics")
@UseGuards(JwtAuthGuard)
export class MetricsController {
  constructor(private metricsService: MetricsService) {}

  @Get("overview")
  getOverview(@CurrentUser("tenantId") tenantId: string) {
    return this.metricsService.getOverview(tenantId);
  }

  @Get("mttr")
  getMTTR(@CurrentUser("tenantId") tenantId: string) {
    return this.metricsService.getMTTR(tenantId);
  }

  @Get("mttd")
  getMTTD(@CurrentUser("tenantId") tenantId: string) {
    return this.metricsService.getMTTD(tenantId);
  }

  @Get("incidents-by-category")
  getIncidentsByCategory(@CurrentUser("tenantId") tenantId: string) {
    return this.metricsService.getIncidentsByCategory(tenantId);
  }

  @Get("timeline")
  getTimeline(
    @CurrentUser("tenantId") tenantId: string,
    @Query("days") days?: string
  ) {
    return this.metricsService.getEventsTimeline(tenantId, days ? parseInt(days) : 30);
  }
}
