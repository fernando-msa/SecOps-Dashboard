import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { ApiKeysService } from "./apikeys.service";

@Controller("api-keys")
@UseGuards(JwtAuthGuard)
export class ApiKeysController {
  constructor(private apiKeysService: ApiKeysService) {}

  @Post()
  create(
    @Body() body: { name: string; permissions?: string[] },
    @CurrentUser("tenantId") tenantId: string
  ) {
    return this.apiKeysService.create(
      body.name,
      body.permissions || ["read"],
      tenantId
    );
  }

  @Get()
  findAll(@CurrentUser("tenantId") tenantId: string) {
    return this.apiKeysService.findAll(tenantId);
  }

  @Patch(":id/revoke")
  revoke(@Param("id") id: string, @CurrentUser("tenantId") tenantId: string) {
    return this.apiKeysService.revoke(id, tenantId);
  }

  @Patch(":id/activate")
  activate(@Param("id") id: string, @CurrentUser("tenantId") tenantId: string) {
    return this.apiKeysService.activate(id, tenantId);
  }

  @Delete(":id")
  remove(@Param("id") id: string, @CurrentUser("tenantId") tenantId: string) {
    return this.apiKeysService.remove(id, tenantId);
  }
}
