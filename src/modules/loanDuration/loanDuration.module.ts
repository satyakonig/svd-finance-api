import { Module } from "@nestjs/common";
import { SharedModule } from "../models/shared.module";
import { LoanDurationController } from "./controller/loanDuration.controller";
import { LoanDurationService } from "./service/loanDuration.service";

@Module({
  imports: [SharedModule],
  controllers: [LoanDurationController],
  providers: [LoanDurationService],
})
export class LoanDurationModule {}
