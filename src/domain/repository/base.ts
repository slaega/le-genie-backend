import { Injectable, OnModuleInit } from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';

export type PrismaRepository<
  ModelName extends Uncapitalize<Prisma.ModelName>,
  Operations extends PrismaClient[ModelName] = PrismaClient[ModelName],
> = {
  [Operation in keyof Operations]: Operations[Operation];
};

@Injectable()
export class PrismaRepositoryService
  extends PrismaClient
  implements OnModuleInit
{
  constructor() {
    super();
  }

  async onModuleInit() {
    await this.$connect();
  }

  createRepository<ModelName extends Uncapitalize<Prisma.ModelName>>(
    modelName: ModelName,
  ): PrismaRepository<ModelName> {
    return this[modelName];
  }
}
