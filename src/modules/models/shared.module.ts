import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { BaseEntity } from "./entity/base.entity";
import { AgentEntity } from "./entity/agent.entity";
import { CustomerEntity } from "./entity/customer.entity";
import { LocationEntity } from "./entity/location.entity";
import { SpentEntity } from "./entity/spent.entity";
import { LoanEntity } from "./entity/loan.entity";
import { LoanPaymentEntity } from "./entity/loan-payment.entity";
import { AreaEntity } from "./entity/area.entity";
import { BFEntity } from "./entity/bf.entity";
import { LoanDurationEntity } from "./entity/loanDuration.entity";
import { AgentLocationEntity } from "./entity/agent.location.entity";
import { DayEntity } from "./entity/day.entity";
import { PhaseEntity } from "./entity/phase.entity";
import { FineEntity } from "./entity/fine.entity";
import { ChitTransactionEntity } from "./entity/chit.transaction.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      BaseEntity,
      AgentEntity,
      CustomerEntity,
      LocationEntity,
      SpentEntity,
      LoanEntity,
      LoanPaymentEntity,
      AreaEntity,
      BFEntity,
      LoanDurationEntity,
      AgentLocationEntity,
      DayEntity,
      PhaseEntity,
      FineEntity,
      ChitTransactionEntity,
    ]),
  ],
  exports: [TypeOrmModule],
})
export class SharedModule {}
