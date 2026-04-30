import { UserRepository } from '#domain/repository/user.repository';
import { Injectable } from '@nestjs/common';

import { PrismaService } from '#infra/framwork/common/prisma/prisma.service';
import { User } from '#domain/entities/user.entity';

@Injectable()
export class UserPrismaRepository implements UserRepository {
    constructor(private readonly prisma: PrismaService) {}
    async getUserById(userId: string): Promise<User | null> {
        return await this.prisma.user.findUnique({
            where: {
                id: userId,
            },
        });
    }
    async getUserByEmail(email: string): Promise<User | null> {
        return await this.prisma.user.findUnique({
            where: {
                email,
            },
        });
    }
    async createUser(user: User): Promise<User> {
        return await this.prisma.user.create({
            data: {
                email: user.email,
                name: user.name,
                avatarPath: user.avatarPath,
            },
        });
    }
    async updateUser(userId: string, user: User): Promise<User> {
        return await this.prisma.user.update({
            where: {
                id: userId,
            },
            data: {
                email: user.email,
                name: user.name,
                avatarPath: user.avatarPath,
            },
        });
    }
    async removeUser(userId: string): Promise<void> {
        await this.prisma.user.delete({
            where: {
                id: userId,
            },
        });
    }
}
