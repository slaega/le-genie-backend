import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString } from 'class-validator';

export class StringFilterDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  equals?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  in?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  notIn?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  lt?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  lte?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  gt?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  gte?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  contains?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  startsWith?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  endsWith?: string;

  @ApiPropertyOptional()
  @IsOptional()
  not?: string | StringFilterDto;
}
