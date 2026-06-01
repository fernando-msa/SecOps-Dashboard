import { Controller, Get, Post, Body, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { TwoFAService } from "./twofa.service";

@Controller("2fa")
@UseGuards(JwtAuthGuard)
export class TwoFAController {
  constructor(private twoFAService: TwoFAService) {}

  @Get("status")
  getStatus(@CurrentUser("id") userId: string) {
    return this.twoFAService.getStatus(userId);
  }

  @Post("generate")
  generate(@CurrentUser("id") userId: string) {
    return this.twoFAService.generateSecret(userId);
  }

  @Post("enable")
  enable(@CurrentUser("id") userId: string, @Body("token") token: string) {
    return this.twoFAService.enable(userId, token);
  }

  @Post("disable")
  disable(@CurrentUser("id") userId: string, @Body("token") token: string) {
    return this.twoFAService.disable(userId, token);
  }
}
