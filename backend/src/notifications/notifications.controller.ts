import { Controller, Get, Post, Body, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { NotificationsService, NotificationPayload } from "./notifications.service";

@Controller("notifications")
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private notificationsService: NotificationsService) {}

  @Post("test")
  test(@Body() body: NotificationPayload) {
    return this.notificationsService.notify(body);
  }

  @Get("config")
  getConfig() {
    return this.notificationsService.getConfigStatus();
  }
}
