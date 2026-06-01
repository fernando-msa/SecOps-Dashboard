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
import { ComplianceService } from "./compliance.service";
import { ComplianceFramework } from "./compliance-check.entity";

@Controller("compliance")
@UseGuards(JwtAuthGuard)
export class ComplianceController {
  constructor(private complianceService: ComplianceService) {}

  @Post()
  create(@Body() body: any, @CurrentUser("tenantId") tenantId: string) {
    return this.complianceService.create({ ...body, tenantId });
  }

  @Get()
  findAll(
    @CurrentUser("tenantId") tenantId: string,
    @Query("framework") framework?: ComplianceFramework
  ) {
    return this.complianceService.findAll(tenantId, framework);
  }

  @Get("summary")
  getSummary(@CurrentUser("tenantId") tenantId: string) {
    return this.complianceService.getSummary(tenantId);
  }

  @Get("framework/:name")
  getByFramework(
    @Param("name") name: ComplianceFramework,
    @CurrentUser("tenantId") tenantId: string
  ) {
    return this.complianceService.findAll(tenantId, name);
  }

  @Get(":id")
  findOne(@Param("id") id: string, @CurrentUser("tenantId") tenantId: string) {
    return this.complianceService.findOne(id, tenantId);
  }

  @Put(":id")
  update(
    @Param("id") id: string,
    @Body() body: any,
    @CurrentUser("tenantId") tenantId: string
  ) {
    return this.complianceService.update(id, tenantId, body);
  }

  @Delete(":id")
  remove(@Param("id") id: string, @CurrentUser("tenantId") tenantId: string) {
    return this.complianceService.remove(id, tenantId);
  }
}
