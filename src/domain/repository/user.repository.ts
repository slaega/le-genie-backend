import { Repository } from "#core/repository";
import { User } from "#domain/entities/user.entity";

export interface UserRepository  {
    findByEmail(email: string): Promise<User | null>;
    createUser(params: { email: string; name: string; avatarUrl?: string }): Promise<User>;
}
