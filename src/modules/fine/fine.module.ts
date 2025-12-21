import { Module } from "@nestjs/common";
import { SharedModule } from "../models/shared.module";
import { FineController } from "./controller/fine.controller";
import { FineService } from "./service/fine.service";

@Module({
  imports: [SharedModule],
  controllers: [FineController],
  providers: [FineService],
})
export class FineModule {}
