import { Module } from "@nestjs/common";
import { SharedModule } from "../models/shared.module";
import { InlineController } from "./controller/inline.controller";
import { InLineService } from "./service/inline.service";

@Module({
  imports: [SharedModule],
  controllers: [InlineController],
  providers: [InLineService],
})
export class InlineModule {}
