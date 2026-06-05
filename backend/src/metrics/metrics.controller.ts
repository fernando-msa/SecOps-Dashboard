import { Controller, Get, Header, Query, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { MetricsService } from "./metrics.service";

@Controller("metrics")
export class MetricsController {
  constructor(private metricsService: MetricsService) {}

  @Get()
  @Header("Content-Type", "text/plain; version=0.0.4; charset=utf-8")
  getPrometheusMetrics() {
    return this.metricsService.getPrometheusMetrics();
  }

  @Get("overview")
  @UseGuards(JwtAuthGuard)
  getOverview(@CurrentUser("tenantId") tenantId: string) {
    return this.metricsService.getOverview(tenantId);
  }

  @Get("mttr")
  @UseGuards(JwtAuthGuard)
  getMTTR(@CurrentUser("tenantId") tenantId: string) {
    return this.metricsService.getMTTR(tenantId);
  }

  @Get("mttd")
  @UseGuards(JwtAuthGuard)
  getMTTD(@CurrentUser("tenantId") tenantId: string) {
    return this.metricsService.getMTTD(tenantId);
  }

  @Get("incidents-by-category")
  @UseGuards(JwtAuthGuard)
  getIncidentsByCategory(@CurrentUser("tenantId") tenantId: string) {
    return this.metricsService.getIncidentsByCategory(tenantId);
  }

  @Get("timeline")
  @UseGuards(JwtAuthGuard)
  getTimeline(
    @CurrentUser("tenantId") tenantId: string,
    @Query("days") days?: string,
  ) {
    return this.metricsService.getEventsTimeline(
      tenantId,
      days ? parseInt(days) : 30,
    );
  }
}
