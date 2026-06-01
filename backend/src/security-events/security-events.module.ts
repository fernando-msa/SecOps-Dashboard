import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { SecurityEvent } from "./security-event.entity";
import { SecurityEventsService } from "./security-events.service";
import { SecurityEventsController } from "./security-events.controller";
import { SecurityEventsGateway } from "./security-events.gateway";

@Module({
  imports: [TypeOrmModule.forFeature([SecurityEvent])],
  providers: [SecurityEventsService, SecurityEventsGateway],
  controllers: [SecurityEventsController],
  exports: [SecurityEventsService],
})
export class SecurityEventsModule {}
