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
import { AssetsService } from "./assets.service";
import { AssetType, AssetCriticality } from "./asset.entity";

@Controller("assets")
@UseGuards(JwtAuthGuard)
export class AssetsController {
  constructor(private assetsService: AssetsService) {}

  @Post()
  create(@Body() body: any, @CurrentUser("tenantId") tenantId: string) {
    return this.assetsService.create({ ...body, tenantId });
  }

  @Get()
  findAll(
    @CurrentUser("tenantId") tenantId: string,
    @Query("type") type?: AssetType,
    @Query("criticality") criticality?: AssetCriticality,
    @Query("status") status?: string
  ) {
    return this.assetsService.findAll(tenantId, { type, criticality, status });
  }

  @Get("stats")
  getStats(@CurrentUser("tenantId") tenantId: string) {
    return this.assetsService.getStats(tenantId);
  }

  @Get(":id")
  findOne(@Param("id") id: string, @CurrentUser("tenantId") tenantId: string) {
    return this.assetsService.findOne(id, tenantId);
  }

  @Put(":id")
  update(
    @Param("id") id: string,
    @Body() body: any,
    @CurrentUser("tenantId") tenantId: string
  ) {
    return this.assetsService.update(id, tenantId, body);
  }

  @Delete(":id")
  remove(@Param("id") id: string, @CurrentUser("tenantId") tenantId: string) {
    return this.assetsService.remove(id, tenantId);
  }
}
