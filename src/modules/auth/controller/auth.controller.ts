import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthenticationService } from '../service/auth.service';
import { JwtAuthGuard } from '../guard/auth.guard';

@Controller('/auth')
export class AuthenticationController {
  constructor(private authService: AuthenticationService) {}

  @Post('/login')
  public authenticateLogin(@Body() data) {
    return this.authService.authenticateUser(data);
  }

  @Get('/userinfo')
  @UseGuards(JwtAuthGuard)
  public getUserInfo(@Request() req) {
    return req.user;
  }
}
