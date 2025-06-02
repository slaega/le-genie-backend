import { mixin } from '@nestjs/common';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional } from 'class-validator';

export function createEnumFilterDto<T>(enumType: T, exampleValue?: any) {
  const enumValues = Object.values(enumType);
  const defaultExample = exampleValue || enumValues[0];

  class MixinDto {
    @ApiPropertyOptional({
      enum: enumValues,
      description: 'Equals filter',
      example: defaultExample,
    })
    @IsOptional()
    @IsIn(enumValues)
    equals?: keyof T;

    @ApiPropertyOptional({
      enum: enumValues,
      isArray: true,
      description: 'In filter',
      example: [defaultExample],
    })
    @IsOptional()
    @IsIn(enumValues, { each: true })
    in?: (keyof T)[];

    @ApiPropertyOptional({
      enum: enumValues,
      isArray: true,
      description: 'Not In filter',
      example: [defaultExample],
    })
    @IsOptional()
    @IsIn(enumValues, { each: true })
    notIn?: (keyof T)[];

    @ApiPropertyOptional({
      enum: enumValues,
      description: 'Not filter',
      example: defaultExample,
    })
    @IsOptional()
    @IsIn(enumValues)
    not?: keyof T;
  }

  return mixin(MixinDto);
}
