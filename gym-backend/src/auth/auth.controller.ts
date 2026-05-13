import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Res,
  Ip,
  Req,
  Get,
  UseGuards
} from "@nestjs/common";
import type { Response, Request } from 'express';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { CurrentUser } from "src/common/decorators/current-user.decorator";
import { Public } from "src/common/decorators/public.decorator";
import { User } from "src/users/entities/user.entity";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login.dto";
import { ResetPasswordDto } from "./dto/reset-password.dto";
import { ForgotPasswordDTO } from "./dto/forgot-password.dto";
import { RegisterDto } from "./dto/register.dto";

const COOKIE_NAME = 'refresh_token';
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days ms
  path: '/auth/refresh', // cookie ONLY sent to refresh endpoint
};

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Public()
  @Post('signup')
  async register(@Body() dto: RegisterDto) {
    const user = await this.authService.register(dto);
    return { message: 'Registration successful', userId: user.id };
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 attempts per minute
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
    @Ip() ip: string,
  ) {
    const { refreshToken, ...tokens } = await this.authService.login(dto, ip);

    // httpOnly cookie — JS in the browser CANNOT read this
    res.cookie(COOKIE_NAME, refreshToken, COOKIE_OPTIONS);

    return tokens; // { accessToken, accessExpires }
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const rawToken = req.cookies?.[COOKIE_NAME];
    if (!rawToken) throw new Error('No refresh token');

    const { refreshToken, ...tokens } = await this.authService.refresh(rawToken);

    // Issue a new cookie with the new refresh token (rotation)
    res.cookie(COOKIE_NAME, refreshToken, COOKIE_OPTIONS);

    return tokens;
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @CurrentUser() user: User,
  ) {
    const accessToken = req.headers.authorization?.split(' ')[1] ?? '';
    const refreshToken = req.cookies?.[COOKIE_NAME];

    await this.authService.logout(user.id, accessToken, refreshToken);

    // Clear the httpOnly cookie
    res.clearCookie(COOKIE_NAME, { path: '/auth/refresh' });

    return { message: 'Logged out' };
  }

  @Public()
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  async forgotPassword(@Body() dto: ForgotPasswordDTO) {
    await this.authService.forgotPassword(dto.email);
    return { message: 'If that email exists, a reset link was sent' };
  }

  @Public()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() dto: ResetPasswordDto) {
    await this.authService.resetPassword(dto.token, dto.password);
    return { message: 'Password updated. Please log in.' };
  }

  @Get('me')
  async getMe(@CurrentUser() user: User) {
    return this.authService.getMe(user.id);
  }
}