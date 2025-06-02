import { applyDecorators } from '@nestjs/common';
import {
  ApiExtraModels,
  ApiQuery,
  ApiQueryOptions,
  getSchemaPath,
} from '@nestjs/swagger';

/**
 * Use this decorator to document the 'filter' query parameter on an endpoint.
 * @param filterQuery The filter query class that needs to be documented.
 * @param options (optional) Use this to overwrite any of the default options.
 * @returns
 */
export function ApiFilterQuery(
  filterQuery: new () => object,
  options?: ApiQueryOptions,
) {
  return applyDecorators(
    ApiExtraModels(filterQuery),
    ApiQuery({
      name: 'filters',
      description:
        "Can be used to filter for the resource's properties. Filter syntax follows the JSON:API specification: https://jsonapi.org/recommendations/#filtering",
      required: false,
      style: 'deepObject',
      schema: {
        $ref: getSchemaPath(filterQuery),
      },
      ...options,
    }),
  );
}
