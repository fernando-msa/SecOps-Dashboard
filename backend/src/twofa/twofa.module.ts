import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "../users/user.entity";
import { TwoFAService } from "./twofa.service";
import { TwoFAController } from "./twofa.controller";

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [TwoFAService],
  controllers: [TwoFAController],
})
export class TwoFAModule {}
