import { Module } from "@nestjs/common";
import { SharedModule } from "../models/shared.module";
import { PartnerTransactionController } from "./controller/partner.transaction.controller";
import { PartnerTransactionService } from "./service/partner.transaction.service";

@Module({
  imports: [SharedModule],
  controllers: [PartnerTransactionController],
  providers: [PartnerTransactionService],
})
export class PartnerTransactionModule {}
