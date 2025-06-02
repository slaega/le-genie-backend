import { TransformToDto } from '#shared/utils/transformers';
import { mixin } from '@nestjs/common';
import { ApiPropertyOptional } from '@nestjs/swagger';

import { Type } from 'class-transformer';
import { IsOptional, ValidateNested } from 'class-validator';

/**
 * Mixin qui génère dynamiquement un DTO de filtre pour les relations Prisma
 */
export function RelationFilterDto<T>(classRef: new () => T) {
  class RelationFilter {
    @ApiPropertyOptional({
      description: 'Filtrer si AU MOINS UN élément de la relation correspond',
      type: () => classRef,
    })
    @IsOptional()
    @ValidateNested()
    @Type(() => classRef)
    @TransformToDto(classRef)
    some?: T;

    @ApiPropertyOptional({
      description: 'Filtrer si TOUS les éléments de la relation correspondent',
      type: () => classRef,
    })
    @IsOptional()
    @ValidateNested()
    @Type(() => classRef)
    @TransformToDto(classRef)
    every?: T;

    @ApiPropertyOptional({
      description: 'Filtrer si AUCUN élément de la relation ne correspond',
      type: () => classRef,
    })
    @IsOptional()
    @ValidateNested()
    @Type(() => classRef)
    @TransformToDto(classRef)
    none?: T;
  }

  return mixin(RelationFilter);
}
