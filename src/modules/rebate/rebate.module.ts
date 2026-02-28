import { Module } from "@nestjs/common";
import { SharedModule } from "../models/shared.module";
import { RebateController } from "./controller/rebate.controller";
import { RebateService } from "./service/rebate.service";

@Module({
  imports: [SharedModule],
  controllers: [RebateController],
  providers: [RebateService],
})
export class RebateModule {}
