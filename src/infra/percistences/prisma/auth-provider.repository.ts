import { Injectable } from '@nestjs/common';
import { AuthProviderRepository } from '#domain/repository/auth-provider.repository';
import { AuthProvider } from '#domain/entities/auth-provider.entity';
import { PrismaProxyRepository } from '#infra/percistences/prisma/prisma';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class AuthProviderPrismaRepository
  extends PrismaProxyRepository<'authProvider'>()
  implements AuthProviderRepository
{
  constructor(prisma: PrismaClient) {
    super(prisma.authProvider);
  }

  async linkAuthProviderToUser(authProvider: AuthProvider): Promise<void> {
    await this.create({
      data: authProvider,
    });
  }
  async unlinkAuthProviderFromUser(authProvider: AuthProvider): Promise<void> {
    await this.delete({
      where: {
        id: authProvider.id,
      },
    });
  }
}
