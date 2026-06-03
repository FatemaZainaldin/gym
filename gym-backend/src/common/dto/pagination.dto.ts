import { Type } from "class-transformer";
import { IsNumber, IsOptional, IsPositive, Min, IsString } from "class-validator";

export class PaginationDto {

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  @IsPositive()
  currentPage?: number = 1;


  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  pageSize?: number = 10;




  @IsOptional()
  @IsString()
  search?: string;
}