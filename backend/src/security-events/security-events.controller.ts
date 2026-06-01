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
import { SecurityEventsService } from "./security-events.service";
import { SecurityEventsGateway } from "./security-events.gateway";
import { EventSeverity, EventStatus } from "./security-event.entity";

@Controller("events")
@UseGuards(JwtAuthGuard)
export class SecurityEventsController {
  constructor(
    private eventsService: SecurityEventsService,
    private eventsGateway: SecurityEventsGateway
  ) {}

  @Post()
  async create(@Body() body: any, @CurrentUser("tenantId") tenantId: string) {
    const event = await this.eventsService.create({ ...body, tenantId });
    this.eventsGateway.notifyNewEvent(event);
    return event;
  }

  @Get()
  findAll(
    @CurrentUser("tenantId") tenantId: string,
    @Query("severity") severity?: EventSeverity,
    @Query("status") status?: EventStatus
  ) {
    return this.eventsService.findAll(tenantId, { severity, status });
  }

  @Get("stats")
  getStats(@CurrentUser("tenantId") tenantId: string) {
    return this.eventsService.getStats(tenantId);
  }

  @Get("recent")
  getRecent(@CurrentUser("tenantId") tenantId: string) {
    return this.eventsService.getRecentAlerts(tenantId);
  }

  @Get(":id")
  findOne(@Param("id") id: string, @CurrentUser("tenantId") tenantId: string) {
    return this.eventsService.findOne(id, tenantId);
  }

  @Put(":id")
  update(
    @Param("id") id: string,
    @Body() body: any,
    @CurrentUser("tenantId") tenantId: string
  ) {
    return this.eventsService.update(id, tenantId, body);
  }

  @Delete(":id")
  remove(@Param("id") id: string, @CurrentUser("tenantId") tenantId: string) {
    return this.eventsService.remove(id, tenantId);
  }
}
