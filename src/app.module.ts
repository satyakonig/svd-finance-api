import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { configService } from "./config/config.service";
import { AuthenticationModule } from "./modules/auth/auth.module";
import { APP_FILTER } from "@nestjs/core";
import { ExceptionsHandler } from "@nestjs/core/exceptions/exceptions-handler";
import { LoggerMiddleware } from "./util/logger.middleware";
import { AgentModule } from "./modules/agent/agent.module";
import { CustomerModule } from "./modules/customer/customer.module";
import { LocationModule } from "./modules/location/location.module";
import { LoanModule } from "./modules/loan/loan.module";
import { SpentModule } from "./modules/spent/spent.module";
import { AreaModule } from "./modules/area/area.module";
import { BFModule } from "./modules/bf/bf.module";
import { LoanDurationModule } from "./modules/loanDuration/loanDuration.module";
import { DayModule } from "./modules/day/day.module";
import { LoanPaymentModule } from "./modules/loanPayment/loan.payment.module";
import { PhaseModule } from "./modules/phase/phase.module";
import { FineModule } from "./modules/fine/fine.module";
import { ChitTransactionModule } from "./modules/chit/chit.transaction.module";

@Module({
  imports: [
    TypeOrmModule.forRoot(configService.getTypeOrmConfig()),
    AuthenticationModule,
    AgentModule,
    CustomerModule,
    LocationModule,
    LoanModule,
    SpentModule,
    AreaModule,
    BFModule,
    LoanDurationModule,
    DayModule,
    LoanPaymentModule,
    PhaseModule,
    FineModule,
    ChitTransactionModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: ExceptionsHandler,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes("*");
  }
}
