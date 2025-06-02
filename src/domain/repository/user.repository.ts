import { User } from '#domain/entities/user.entity';

export interface UserRepository {
  getUserById(userId: string): Promise<User | null>;
  getUserByEmail(email: string): Promise<User | null>;
  createUser(user: User): Promise<User>;
  updateUser(userId: string, user: User): Promise<User>;
  removeUser(userId: string): Promise<void>;
}
