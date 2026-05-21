import {
  ExceptionFilter, Catch, ArgumentsHost,
  HttpException, HttpStatus, Logger
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx  = host.switchToHttp();
    const res  = ctx.getResponse<Response>();
    const req  = ctx.getRequest<Request>();

    let status  = HttpStatus.INTERNAL_SERVER_ERROR;
    let name    = 'INTERNAL_ERROR';
    let message = {
      en: 'Something went wrong. Please try again.',
      ar: 'حدث خطأ ما. يرجى المحاولة مجدداً.',
    };

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const body = exception.getResponse() as any;

      // If message already has our shape — use it directly
      if (body?.message?.en) {
        name    = body.name    ?? this.statusToName(status);
        message = body.message;
      } else {
        name    = this.statusToName(status);
        message = this.statusToMessage(status, body?.message);
      }
    }

    this.logger.error(`${req.method} ${req.url} → ${status} ${name}`);

    res.status(status).json({
      success:   false,
      name,
      message,
      path:      req.url,
      timestamp: new Date().toISOString(),
    });
  }

  private statusToName(status: number): string {
    const map: Record<number, string> = {
      400: 'BAD_REQUEST',
      401: 'UNAUTHORIZED',
      403: 'FORBIDDEN',
      404: 'NOT_FOUND',
      409: 'CONFLICT',
      422: 'VALIDATION_ERROR',
      429: 'TOO_MANY_REQUESTS',
      500: 'INTERNAL_ERROR',
    };
    return map[status] ?? 'UNKNOWN_ERROR';
  }

  private statusToMessage(status: number, detail?: string): { en: string; ar: string } {
    const map: Record<number, { en: string; ar: string }> = {
      400: { en: detail ?? 'Invalid request data.',          ar: 'بيانات الطلب غير صحيحة.' },
      401: { en: 'Invalid credentials.',                     ar: 'بيانات الدخول غير صحيحة.' },
      403: { en: 'You do not have permission.',              ar: 'ليس لديك صلاحية للوصول.' },
      404: { en: 'The requested resource was not found.',    ar: 'العنصر المطلوب غير موجود.' },
      409: { en: detail ?? 'This record already exists.',   ar: 'هذا السجل موجود مسبقاً.' },
      422: { en: 'Validation failed.',                       ar: 'فشل التحقق من البيانات.' },
      429: { en: 'Too many requests. Please slow down.',     ar: 'طلبات كثيرة جداً. يرجى الانتظار.' },
      500: { en: 'Something went wrong. Please try again.',  ar: 'حدث خطأ ما. يرجى المحاولة مجدداً.' },
    };
    return map[status] ?? { en: 'An error occurred.', ar: 'حدث خطأ.' };
  }
}