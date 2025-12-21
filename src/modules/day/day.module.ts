import { Module } from "@nestjs/common";
import { SharedModule } from "../models/shared.module";
import { DayController } from "./controller/day.controller";
import { DayService } from "./service/day.service";

@Module({
  imports: [SharedModule],
  controllers: [DayController],
  providers: [DayService],
})
export class DayModule {}
