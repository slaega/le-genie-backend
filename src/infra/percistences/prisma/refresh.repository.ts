import { PrismaRepository } from '#infra/percistences/prisma/prisma-repository';
import { Injectable } from '@nestjs/common';

import { PrismaClient } from '@prisma/client';

@Injectable()
export class RefreshTokenRepository extends PrismaRepository<
  PrismaClient['refreshToken']
> {
  constructor(prisma: PrismaClient) {
    super(prisma.refreshToken);
  }
}
