import { ApiResponseDto } from '../dto/api-response.dto';

export function success<T>(
  name: string,
  message: { en: string; ar: string },
  data?: T,
  meta?: any,
): ApiResponseDto<T> {
  return { success: true, name, message, data, meta };
}

export function fail(
  name: string,
  message: { en: string; ar: string },
): ApiResponseDto {
  return { success: false, name, message };
}