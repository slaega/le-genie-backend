import { UserResponseDto } from '#dto/auth/user-response.dto';
import { User } from '#domain/entities/user.entity';

export class UserMapper {
    static toDto(raw: any): UserResponseDto {
        const dto = new UserResponseDto();
        dto.id = raw.id;
        dto.name = raw.name;
        dto.email = raw.email;
        dto.avatarPath = raw.avatarPath ?? null;
        dto.coverPath = raw.coverPath ?? null;
        dto.professionalRole = raw.professionalRole ?? null;
        dto.bio = raw.bio ?? null;
        dto.about = raw.about ?? null;
        dto.website = raw.website ?? null;
        dto.twitterHandle = raw.twitterHandle ?? null;
        dto.githubHandle = raw.githubHandle ?? null;
        dto.location = raw.location ?? null;
        dto.role = raw.role ?? 'USER';
        dto.suspended = raw.suspended ?? false;
        dto.createdAt = raw.createdAt instanceof Date
            ? raw.createdAt.toISOString()
            : (raw.createdAt ?? '');
        dto.updatedAt = raw.updatedAt instanceof Date
            ? raw.updatedAt.toISOString()
            : (raw.updatedAt ?? '');
        return dto;
    }

    static toDomain(raw: any): User {
        const user = new User();
        user.id = raw.id;
        user.name = raw.name;
        user.avatarPath = raw.avatarPath ?? null;
        user.email = raw.email;
        return user;
    }
}
