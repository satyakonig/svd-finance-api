import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as bodyParser from 'body-parser';
import { configService } from './config/config.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['log', 'error', 'warn'],
  });

  app.enableCors();
  app.use(bodyParser.json({ limit: '50mb' }));
  const types = require('pg').types;
  types.setTypeParser(20, function (val) {
    return parseInt(val);
  });
  await app.listen(configService.getPort());
}
bootstrap();
