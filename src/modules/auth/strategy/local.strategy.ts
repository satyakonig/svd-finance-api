import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Body, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthenticationService } from '../service/auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthenticationService) {
    super();
  }

  async validate(@Body() payload): Promise<any> {
    const user = await this.authService.authenticateUser(payload);
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
