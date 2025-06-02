import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional } from 'class-validator';

export class DateTimeFilterDto {
  @ApiPropertyOptional({
    type: String,
    format: 'date-time',
    description: 'Equal to filter',
  })
  @IsOptional()
  @IsDateString()
  equals?: string;

  @ApiPropertyOptional({
    type: String,
    format: 'date-time',
    description: 'Greater than filter',
  })
  @IsOptional()
  @IsDateString()
  gt?: string;

  @ApiPropertyOptional({
    type: String,
    format: 'date-time',
    description: 'Greater than or equal to filter',
  })
  @IsOptional()
  @IsDateString()
  gte?: string;

  @ApiPropertyOptional({
    type: String,
    format: 'date-time',
    description: 'Less than filter',
  })
  @IsOptional()
  @IsDateString()
  lt?: string;

  @ApiPropertyOptional({
    type: String,
    format: 'date-time',
    description: 'Less than or equal to filter',
  })
  @IsOptional()
  @IsDateString()
  lte?: string;

  @ApiPropertyOptional({
    type: String,
    format: 'date-time',
    description: 'Not equal filter',
  })
  @IsOptional()
  @IsDateString()
  not?: string;
}
