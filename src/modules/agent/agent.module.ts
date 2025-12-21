import { Module } from '@nestjs/common';
import { AgentController } from './controller/agent.controller';
import { AgentService } from './service/agent.service';
import { SharedModule } from '../models/shared.module';

@Module({
  imports: [SharedModule],
  controllers: [AgentController],
  providers: [AgentService],
})
export class AgentModule {}
