import { Transform } from 'class-transformer';

export const removeSpacesTransformer = () =>
  Transform(({ value }) =>
    typeof value === 'string' ? value.replace(/\s+/g, '') : value,
  );
