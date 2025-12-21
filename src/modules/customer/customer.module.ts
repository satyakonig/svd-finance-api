import { Module } from '@nestjs/common';
import { SharedModule } from '../models/shared.module';
import { CustomerController } from './controller/customer.controller';
import { CustomerService } from './service/customer.service';

@Module({
  imports: [SharedModule],
  controllers: [CustomerController],
  providers: [CustomerService],
})
export class CustomerModule {}
