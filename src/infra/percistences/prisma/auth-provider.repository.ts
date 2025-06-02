import { PrismaRepository } from '#infra/percistences/prisma/prisma-repository';
import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { AuthProviderRepository } from '#domain/repository/auth-provider.repository';
import { AuthProvider } from '#domain/entities/auth-provider.entity';

@Injectable()
export class AuthProviderPrismaRepository
  extends PrismaRepository<PrismaClient['authProvider']>
  implements AuthProviderRepository
{
  constructor(prisma: PrismaClient) {
    super(prisma.authProvider);
  }
  async createOne(data: AuthProvider): Promise<AuthProvider> {
    const created = await this.create({
      data,
    });
    return created;
  }
  async updateOne(
    id: string,
    data: Partial<AuthProvider>,
  ): Promise<AuthProvider> {
    const updated = await this.update({
      where: { id },
      data,
    });
    return updated;
  }
  async findAll(filter?: Partial<AuthProvider>): Promise<AuthProvider[]> {
    return this.findMany({
      where: filter,
    });
  }
  async findOne(filter: Partial<AuthProvider>): Promise<AuthProvider | null> {
    const found = await this.findFirst({
      where: filter,
    });
    return found;
  }
  async removeOne(id: string): Promise<void> {
    await this.delete({
      where: { id },
    });
  }
}
