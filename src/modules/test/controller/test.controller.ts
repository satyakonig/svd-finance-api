import { Body, Controller, Get, Post, Query, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../../auth/guard/auth.guard";
import { TestService } from "../service/test.service";

@Controller("test")
@UseGuards(JwtAuthGuard)
export class TestController {
  constructor(private testService: TestService) {}

  @Get("test")
  public test() {
    return this.testService.test();
  }
}
