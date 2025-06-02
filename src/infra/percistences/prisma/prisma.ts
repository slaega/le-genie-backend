import { PrismaClient } from '@prisma/client';

/**
 * Mappe les modèles Prisma à leurs délégués
 */
type PrismaModelDelegates = {
  [K in keyof PrismaClient]: PrismaClient[K] extends { findMany: any }
    ? K
    : never;
}[keyof PrismaClient];

/**
 * Détermine le type du délégué Prisma basé sur le nom du modèle
 */
type PrismaDelegate<ModelName extends PrismaModelDelegates> =
  PrismaClient[ModelName];

/**
 * Liste des méthodes Prisma par défaut
 */
const DEFAULT_METHODS = [
  'aggregate',
  'count',
  'create',
  'createMany',
  'delete',
  'findFirst',
  'findFirstOrThrow',
  'findMany',
  'findUnique',
  'findUniqueOrThrow',
  'update',
  'updateMany',
  'upsert',
] as const;

/**
 * Crée un proxy pour un délégué Prisma avec typage strict
 */
export function PrismaProxyRepository<
  ModelName extends PrismaModelDelegates,
>() {
  class Decorator {
    // @ts-ignore
    constructor(private readonly target: PrismaDelegate<ModelName>) {}

    [key: string]: any;
  }

  for (const method of DEFAULT_METHODS) {
    (Decorator.prototype as any)[method] = function (...args: any[]) {
      return this.target[method](...args);
    };
  }
  // @ts-ignore
  return Decorator as new (
    target: PrismaDelegate<ModelName>,
  ) => PrismaDelegate<ModelName>;
}
