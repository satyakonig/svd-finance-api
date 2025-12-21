import { Module } from '@nestjs/common';
import { SharedModule } from '../models/shared.module';
import { SpentController } from './controller/spent.controller';
import { SpentService } from './service/spent.service';

@Module({
  imports: [SharedModule],
  controllers: [SpentController],
  providers: [SpentService],
})
export class SpentModule {}
