import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { configService } from '../../config/config.service';
import { AuthenticationController } from './controller/auth.controller';
import { AuthenticationService } from './service/auth.service';
import { JwtStrategy } from './strategy/jwt.strategy';
import { LocalStrategy } from './strategy/local.strategy';
import { SharedModule } from '../models/shared.module';

@Module({
  imports: [
    SharedModule,
    PassportModule,
    JwtModule.register({
      secret: configService.getJwtSecret(),
      signOptions: { expiresIn: '12h' },
    }),
  ],
  controllers: [AuthenticationController],
  providers: [AuthenticationService, LocalStrategy, JwtStrategy],
})
export class AuthenticationModule {}
