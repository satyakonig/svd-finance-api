import { Module } from '@nestjs/common';
import { SharedModule } from '../models/shared.module';
import { LocationController } from './controller/location.controller';
import { LocationService } from './service/location.service';

@Module({
  imports: [SharedModule],
  controllers: [LocationController],
  providers: [LocationService],
})
export class LocationModule {}
