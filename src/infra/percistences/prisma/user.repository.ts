import { PrismaRepository } from '#infra/percistences/prisma/prisma-repository';
import { UserRepository } from '#domain/repository/user.repository';
import { Injectable } from '@nestjs/common';

import { PrismaClient } from '@prisma/client';
import { User } from '#domain/entities/user.entity';

@Injectable()
export class UserPrismaRepository
  extends PrismaRepository<PrismaClient['user']>
  implements UserRepository
{
  constructor(prisma: PrismaClient) {
    super(prisma.user);
  }
  async findOne(filter: Partial<User>): Promise<User | null> {
    return this.findFirst({
      where: {
        ...filter,
        authProviders: {},
      },
      include: { authProviders: true },
    });
  }

  async createOne(params: {
    email: string;
    name: string;
    avatarUrl?: string;
  }): Promise<User> {
    const created = await this.create({
      data: {
        email: params.email,
        name: params.name,
        avatarPath: params.avatarUrl,
      },
    });
    return created;
  }
  async updateOne(id: string, data: Partial<User>): Promise<User> {
    return this.update({
      where: { id },
      data: {
        email: data.email,
        name: data.name,
        avatarPath: data.avatarUrl,
      },
    });
  }
  async removeOne(id: string): Promise<void> {
    await this.delete({
      where: { id },
    });
  }
  async findAll(filter?: Partial<User>): Promise<User[]> {
    return await this.findMany({
      where: {
        ...filter,
        authProviders: {},
      },
      include: { authProviders: true },
    });
  }
}
