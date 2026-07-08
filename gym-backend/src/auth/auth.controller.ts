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
  UseGuards,
  UnauthorizedException,
  Param,
} from "@nestjs/common";
import type { Response, Request } from 'express';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { CurrentUser } from "src/common/decorators/current-user.decorator";
import { Public }      from "src/common/decorators/public.decorator";
import { User }        from "src/users/entities/user.entity";
import { AuthService } from "./auth.service";
import { LoginDto }    from "./dto/login.dto";
import { ResetPasswordDto }  from "./dto/reset-password.dto";
import { ForgotPasswordDTO } from "./dto/forgot-password.dto";
import { RegisterDto }       from "./dto/register.dto";
import { success }           from "src/common/helpers/response.helper";

const COOKIE_NAME    = 'refresh_token';
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure:   process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  maxAge:   2 * 60 * 1000,
  path:     '/auth/refresh',
};

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // ── REGISTER ─────────────────────────────────────────────────────────────
  @Public()
  @Post('signup')
  async register(@Body() dto: RegisterDto) {
    const user = await this.authService.register(dto);
    return success(
      'REGISTER_SUCCESS',
      {
        en: 'Account created successfully. Please sign in.',
        ar: 'تم إنشاء الحساب بنجاح. يرجى تسجيل الدخول.',
      },
      { userId: user.id },
    );
  }

  // ── LOGIN ─────────────────────────────────────────────────────────────────
  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
    @Ip() ip: string,
  ) {
    const { refreshToken, ...tokens } = await this.authService.login(dto, ip);

    res.cookie(COOKIE_NAME, refreshToken, COOKIE_OPTIONS);

    return success(
      'LOGIN_SUCCESS',
      {
        en: 'Welcome back! You have signed in successfully.',
        ar: 'مرحباً بعودتك! تم تسجيل دخولك بنجاح.',
      },
      tokens,
    );
  }

  // ── REFRESH ───────────────────────────────────────────────────────────────
  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const rawToken = req.cookies?.[COOKIE_NAME];

    if (!rawToken) {
      throw new UnauthorizedException({
        name: 'NO_REFRESH_TOKEN',
        message: {
          en: 'Session expired. Please sign in again.',
          ar: 'انتهت الجلسة. يرجى تسجيل الدخول مجدداً.',
        },
      });
    }

    const { refreshToken, ...tokens } = await this.authService.refresh(rawToken);

    res.cookie(COOKIE_NAME, refreshToken, COOKIE_OPTIONS);

    return success(
      'TOKEN_REFRESHED',
      {
        en: 'Session refreshed successfully.',
        ar: 'تم تجديد الجلسة بنجاح.',
      },
      tokens,
    );
  }

  // ── LOGOUT ────────────────────────────────────────────────────────────────
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @CurrentUser() user: User,
  ) {
    const accessToken  = req.headers.authorization?.split(' ')[1] ?? '';
    const refreshToken = req.cookies?.[COOKIE_NAME];

    await this.authService.logout(user.id, accessToken, refreshToken);

    res.clearCookie(COOKIE_NAME, { path: '/auth/refresh' });

    return success(
      'LOGOUT_SUCCESS',
      {
        en: 'You have been signed out successfully.',
        ar: 'تم تسجيل خروجك بنجاح.',
      },
    );
  }

  // ── FORGOT PASSWORD ───────────────────────────────────────────────────────
  @Public()
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  async forgotPassword(@Body() dto: ForgotPasswordDTO) {
    await this.authService.forgotPassword(dto.email);

    // Always return success — never reveal if email exists
    return success(
      'FORGOT_PASSWORD_SENT',
      {
        en: 'If that email exists, a reset link has been sent.',
        ar: 'إذا كان البريد الإلكتروني موجوداً، فقد تم إرسال رابط إعادة تعيين كلمة المرور.',
      },
    );
  }

  // ── RESET PASSWORD ────────────────────────────────────────────────────────
  @Public()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() dto: ResetPasswordDto) {
    await this.authService.resetPassword(dto.token, dto.password);

    return success(
      'RESET_PASSWORD_SUCCESS',
      {
        en: 'Password updated successfully. Please sign in.',
        ar: 'تم تحديث كلمة المرور بنجاح. يرجى تسجيل الدخول.',
      },
    );
  }

  // ── GET ME ────────────────────────────────────────────────────────────────
  @Get('me')
  async getMe(@CurrentUser() user: User) {
    const data = await this.authService.getMe(user.id);

    return success(
      'USER_FETCHED',
      {
        en: 'User profile loaded.',
        ar: 'تم تحميل الملف الشخصي.',
      },
      data,
    );
  }
}