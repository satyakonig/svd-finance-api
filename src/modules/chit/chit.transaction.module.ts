import { Module } from "@nestjs/common";
import { SharedModule } from "../models/shared.module";
import { ChitTransactionController } from "./controller/chit.transaction.controller";
import { ChitTransactionService } from "./service/chit.transaction.service";

@Module({
  imports: [SharedModule],
  controllers: [ChitTransactionController],
  providers: [ChitTransactionService],
})
export class ChitTransactionModule {}
