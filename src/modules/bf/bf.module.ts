import { Module } from "@nestjs/common";
import { SharedModule } from "../models/shared.module";
import { BFController } from "./controller/bf.controller";
import { BFService } from "./service/bf.service";

@Module({
  imports: [SharedModule],
  controllers: [BFController],
  providers: [BFService],
})
export class BFModule {}
