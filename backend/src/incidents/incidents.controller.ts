import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { IncidentsService } from "./incidents.service";
import { IncidentStatus } from "./incident.entity";

@Controller("incidents")
@UseGuards(JwtAuthGuard)
export class IncidentsController {
  constructor(private incidentsService: IncidentsService) {}

  @Post()
  create(@Body() body: any, @CurrentUser() user: any) {
    return this.incidentsService.create({ ...body, tenantId: user.tenantId }, user.id);
  }

  @Get()
  findAll(
    @CurrentUser("tenantId") tenantId: string,
    @Query("status") status?: IncidentStatus,
    @Query("severity") severity?: string
  ) {
    return this.incidentsService.findAll(tenantId, { status, severity });
  }

  @Get("stats")
  getStats(@CurrentUser("tenantId") tenantId: string) {
    return this.incidentsService.getStats(tenantId);
  }

  @Get(":id")
  findOne(@Param("id") id: string, @CurrentUser("tenantId") tenantId: string) {
    return this.incidentsService.findOne(id, tenantId);
  }

  @Put(":id")
  update(@Param("id") id: string, @Body() body: any, @CurrentUser() user: any) {
    return this.incidentsService.update(id, user.tenantId, body, user.id);
  }

  @Patch(":id/assign")
  assign(
    @Param("id") id: string,
    @Body() body: { assignTo: string },
    @CurrentUser() user: any
  ) {
    return this.incidentsService.assign(id, user.tenantId, body.assignTo, user.id);
  }

  @Patch(":id/escalate")
  escalate(
    @Param("id") id: string,
    @Body() body: { escalateTo: string; reason: string },
    @CurrentUser() user: any
  ) {
    return this.incidentsService.escalate(
      id,
      user.tenantId,
      body.escalateTo,
      body.reason,
      user.id
    );
  }

  @Patch(":id/resolve")
  resolve(
    @Param("id") id: string,
    @Body() body: { resolution: string },
    @CurrentUser() user: any
  ) {
    return this.incidentsService.resolve(id, user.tenantId, body.resolution, user.id);
  }

  @Patch(":id/close")
  close(@Param("id") id: string, @CurrentUser() user: any) {
    return this.incidentsService.close(id, user.tenantId, user.id);
  }

  @Post(":id/notes")
  addNote(
    @Param("id") id: string,
    @Body() body: { note: string },
    @CurrentUser() user: any
  ) {
    return this.incidentsService.addNote(id, user.tenantId, body.note, user.id);
  }
}
