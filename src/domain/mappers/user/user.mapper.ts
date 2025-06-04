import { UserResponseDto } from '#dto/auth/user-response.dto';
import { User } from '#domain/entities/user.entity';

export class UserMapper {
    static toDto(userEntity: User): UserResponseDto {
        const user = new UserResponseDto();
        user.id = userEntity.id;
        user.name = userEntity.name;
        user.avatarPath = userEntity.avatarPath;
        user.email = userEntity.email;

        return user;
    }

    static toDomain(userDto: UserResponseDto): User {
        const user = new User();
        user.id = userDto.id;
        user.name = userDto.name;
        user.avatarPath = userDto.avatarPath;
        user.email = userDto.email;

        return user;
    }
}
