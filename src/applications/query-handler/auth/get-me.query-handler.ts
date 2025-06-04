import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetMeQuery } from '#applications/query/auth/get-me.query';
import { User } from '#domain/entities/user.entity';
import { USER_REPOSITORY } from '#shared/constantes/inject-token';
import { Inject, NotFoundException } from '@nestjs/common';
import { UserRepository } from '#domain/repository/user.repository';

@QueryHandler(GetMeQuery)
export class GetMeQueryHandler implements IQueryHandler<GetMeQuery, User> {
    constructor(
        @Inject(USER_REPOSITORY)
        private readonly userRepository: UserRepository
    ) {}

    async execute(query: GetMeQuery): Promise<User> {
        const user = await this.userRepository.getUserById(query.userId);
        if (!user) {
            throw new NotFoundException({ error: 'User not found' });
        }
        return user;
    }
}
