import { Controller, Get, Post, Body, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { SoarService, AutomatedAction } from "./soar.service";

@Controller("soar")
@UseGuards(JwtAuthGuard)
export class SoarController {
  constructor(private soarService: SoarService) {}

  @Post("execute")
  execute(@Body() body: AutomatedAction) {
    return this.soarService.executeAction(body);
  }

  @Get("actions")
  getActions() {
    return this.soarService.getAvailableActions();
  }
}
