import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Playbook } from "./playbook.entity";
import { PlaybooksService } from "./playbooks.service";
import { PlaybooksController } from "./playbooks.controller";

@Module({
  imports: [TypeOrmModule.forFeature([Playbook])],
  providers: [PlaybooksService],
  controllers: [PlaybooksController],
  exports: [PlaybooksService],
})
export class PlaybooksModule {}
