import { Controller, Post, Body, BadRequestException, InternalServerErrorException, UnauthorizedException, Req, Get, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterAuthDto } from './dto/register-auth.dto';
import { LoginAuthDto } from './dto/login-auth.dto';
import { Request } from 'express';
import { AuthGuard } from './guards/auth.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly authGuard: AuthGuard) { }

  @Post('register')
  async register(@Body() registerAuthDto: RegisterAuthDto) {
    return this.authService.register(registerAuthDto);
  }


  @Post('login')
  async login(@Body() loginAuthDto: LoginAuthDto) {
    return this.authService.login(loginAuthDto);
  }

  @Post('verify')
  async verify(@Req() req: Request) {
    const token = req.cookies['token'];
    if (!token) {
      throw new UnauthorizedException('Unauthorized');
    }
    // return this.authService.validateToken(token);
    return this.authGuard.verifyToken(token);
  }
}