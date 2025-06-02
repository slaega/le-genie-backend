import { PrismaRepository } from '#infra/percistences/prisma/prisma-repository';
import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { AuthProviderRepository } from '#domain/repository/auth-provider.repository';
import { AuthProvider, SocialProvider } from '#domain/entities/auth-provider.entity';

@Injectable()
export class AuthProviderPrismaRepository extends PrismaRepository<
  PrismaClient['authProvider']
> implements AuthProviderRepository { 
  constructor(prisma: PrismaClient) {
    super(prisma.authProvider);
  }
 
  async linkProvider(params: {
    userId: string;
    provider: SocialProvider;
    providerUserId: string;
  }): Promise<void> {
    await this.create({
      data: {
        provider: params.provider,
        providerUserId: params.providerUserId,
        userId: params.userId,
      },
    });
  }

  async unlinkProvider(params: {
    userId: string;
    provider: SocialProvider;
  }): Promise<void> {
    await this.delete({
      where: {
        userId_provider: {
          userId: params.userId,
          provider: params.provider,
        },
      },
    });
  }

  async findProvidersByUser(userId: string): Promise<AuthProvider[]> {
    const providers = await this.findMany({
      where: {
        userId,
      },
    });
    return providers as AuthProvider[];
  }
}

