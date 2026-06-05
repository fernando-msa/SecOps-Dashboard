import { Controller, Get, HttpCode, HttpStatus } from "@nestjs/common";
import { HealthService } from "./health.service";

@Controller()
export class HealthController {
  constructor(private healthService: HealthService) {}

  @Get("health")
  @HttpCode(HttpStatus.OK)
  getHealth() {
    return this.healthService.getHealth();
  }

  @Get("ready")
  async getReadiness() {
    return this.healthService.getReadiness();
  }
}
