// src/common/dto/api-response.dto.ts
export class ApiResponseDto<T = any> {
  success: boolean;
  name:    string;     
  message: { en: string; ar: string };
  data?:   T;
  meta?:   { page?: number; total?: number; limit?: number , pageSize:number};
}