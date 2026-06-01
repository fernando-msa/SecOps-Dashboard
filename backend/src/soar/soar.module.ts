import { Module } from "@nestjs/common";
import { SoarService } from "./soar.service";
import { SoarController } from "./soar.controller";

@Module({
  providers: [SoarService],
  controllers: [SoarController],
})
export class SoarModule {}
