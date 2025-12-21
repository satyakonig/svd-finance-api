import { Module } from "@nestjs/common";
import { SharedModule } from "../models/shared.module";
import { LoanPaymentController } from "./controller/loan.payment.controller";
import { LoanPaymentService } from "./service/loan.payment.service";

@Module({
  imports: [SharedModule],
  controllers: [LoanPaymentController],
  providers: [LoanPaymentService],
})
export class LoanPaymentModule {}
