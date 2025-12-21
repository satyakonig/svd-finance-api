import { Module } from "@nestjs/common";
import { SharedModule } from "../models/shared.module";
import { AreaController } from "./controller/area.controller";
import { AreaService } from "./service/area.service";

@Module({
  imports: [SharedModule],
  controllers: [AreaController],
  providers: [AreaService],
})
export class AreaModule {}
