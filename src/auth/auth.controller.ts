import { Body, Controller, Get, Post, Req, Res } from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { REFRESH_COOKIE } from '../common/cookies.js';
import type { PublicUser } from '../modules/users/users.service.js';
import { AuthService } from './auth.service.js';
import { CurrentUser } from './decorators/current-user.decorator.js';
import { Public } from './decorators/public.decorator.js';
import { ChangePasswordDto } from './dto/change-password.dto.js';
import { LoginDto } from './dto/login.dto.js';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @ApiOperation({ summary: 'Log in and start a session' })
  login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    return this.authService.login(dto, res);
  }

  @Public()
  @Post('refresh')
  @ApiOperation({ summary: 'Rotate the refresh token and issue a new session' })
  refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    return this.authService.refresh(req.cookies?.[REFRESH_COOKIE], res);
  }

  @Post('logout')
  @ApiCookieAuth()
  @ApiOperation({
    summary: 'Revoke the current refresh token and clear cookies',
  })
  logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    return this.authService.logout(req.cookies?.[REFRESH_COOKIE], res);
  }

  @Get('me')
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Get the currently authenticated user' })
  me(@CurrentUser() user: PublicUser) {
    return this.authService.me(user.id);
  }

  @Post('change-password')
  @ApiCookieAuth()
  @ApiOperation({
    summary: 'Change the current password and revoke other sessions',
  })
  changePassword(
    @CurrentUser() user: PublicUser,
    @Body() dto: ChangePasswordDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.changePassword(user.id, dto, res);
  }
}
