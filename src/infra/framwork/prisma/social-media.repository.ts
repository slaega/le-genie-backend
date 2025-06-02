import { PrismaRepository } from '@/infra/percistences/prisma/prisma-repository';
import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { SocialMediaRepositoryI } from '@/domain/repository/social-media.repository';
import { SocialMedia, SocialProvider } from '../../../domain/entities/auth-provider.entity';

@Injectable()
export class SocialMediaRepository extends PrismaRepository<
  PrismaClient['socialMedia']
> implements SocialMediaRepositoryI { 
  constructor(prisma: PrismaClient) {
    super(prisma.socialMedia);
  }

  linkProvider(params: {
    userId: string;
    provider: SocialProvider;
    providerUserId: string;
  }): Promise<void> {
    throw new Error('Method not implemented.');
  }

  unlinkProvider(params: {
    userId: string;
    provider: SocialProvider;
  }): Promise<void> {
    throw new Error('Method not implemented.');
  }

  findProvidersByUser(userId: string): Promise<SocialMedia[]> {
    throw new Error('Method not implemented.');
  }
}

