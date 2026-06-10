export class ApiResponseDto<T = any> {
  success: boolean;
  name: string;
  message: { en: string; ar: string };
  data?: T;
  meta?: { page?: number; total?: number; limit?: number};
}

