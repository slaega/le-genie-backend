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
  async findByEmail(email: string): Promise<User | null> {
    return this.findUnique({
      where: { email },
      include: { authProviders: true },
    });
  }

  async createUser(params: {
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
}
