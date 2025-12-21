import { Module } from "@nestjs/common";
import { SharedModule } from "../models/shared.module";
import { TestController } from "./controller/test.controller";
import { TestService } from "./service/test.service";

@Module({
  imports: [SharedModule],
  controllers: [TestController],
  providers: [TestService],
})
export class TestModule {}
