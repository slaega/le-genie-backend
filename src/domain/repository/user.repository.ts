import { User } from '#domain/entities/user.entity';
import { Repository } from '#core/repository';

export type UserRepository = Repository<User>;
