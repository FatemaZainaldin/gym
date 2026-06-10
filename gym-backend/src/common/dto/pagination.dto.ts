import { Type } from "class-transformer";
import { IsNumber, IsOptional, IsPositive, Min, IsString, IsEnum } from "class-validator";

export enum SortOrder {
ASC = 'ASC',
DESC = 'DESC' 
} 
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

  @IsOptional()
  @IsString()
  sortBy?: string;

  @IsOptional()
  @IsEnum(SortOrder)
  sortOrder? : SortOrder = SortOrder.ASC;
}