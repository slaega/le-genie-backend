import { SetMetadata } from '@nestjs/common';

/** Marque une route comme publique — contourne le JWT guard global */
export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
