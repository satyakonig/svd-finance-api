import { Module } from '@nestjs/common';
import { SharedModule } from '../models/shared.module';
import { LoanController } from './controller/loan.controller';
import { LoanService } from './service/loan.service';

@Module({
  imports: [SharedModule],
  controllers: [LoanController],
  providers: [LoanService],
})
export class LoanModule {}
