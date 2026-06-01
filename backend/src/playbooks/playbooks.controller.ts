import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Patch,
  Body,
  Param,
  UseGuards,
} from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { PlaybooksService } from "./playbooks.service";

@Controller("playbooks")
@UseGuards(JwtAuthGuard)
export class PlaybooksController {
  constructor(private playbooksService: PlaybooksService) {}

  @Post()
  create(@Body() body: any, @CurrentUser("tenantId") tenantId: string) {
    return this.playbooksService.create({ ...body, tenantId });
  }

  @Get()
  findAll(@CurrentUser("tenantId") tenantId: string) {
    return this.playbooksService.findAll(tenantId);
  }

  @Get(":id")
  findOne(@Param("id") id: string, @CurrentUser("tenantId") tenantId: string) {
    return this.playbooksService.findOne(id, tenantId);
  }

  @Put(":id")
  update(
    @Param("id") id: string,
    @Body() body: any,
    @CurrentUser("tenantId") tenantId: string
  ) {
    return this.playbooksService.update(id, tenantId, body);
  }

  @Patch(":id/toggle")
  toggle(@Param("id") id: string, @CurrentUser("tenantId") tenantId: string) {
    return this.playbooksService.toggleActive(id, tenantId);
  }

  @Delete(":id")
  remove(@Param("id") id: string, @CurrentUser("tenantId") tenantId: string) {
    return this.playbooksService.remove(id, tenantId);
  }
}
