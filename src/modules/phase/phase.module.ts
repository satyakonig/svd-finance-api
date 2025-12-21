import { Module } from "@nestjs/common";
import { SharedModule } from "../models/shared.module";
import { PhaseController } from "./controller/phase.controller";
import { PhaseService } from "./service/phase.service";

@Module({
  imports: [SharedModule],
  controllers: [PhaseController],
  providers: [PhaseService],
})
export class PhaseModule {}
