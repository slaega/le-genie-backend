import { ApiPropertyOptional } from '@nestjs/swagger';

export function ApiPropertyRelationOptional<T>(
  classRef: new () => T,
): PropertyDecorator {
  return ApiPropertyOptional({
    description: 'Filtrer si AU MOINS UN élément de la relation correspond',
    type: classRef,
  });
}
