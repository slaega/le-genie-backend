import { IsEnum, IsOptional } from 'class-validator';

export class PaginationQuery {
    @IsOptional()
    page?: string;

    @IsOptional()
    limit?: string;
}

export class UpdateUserDto {
    @IsOptional()
    @IsEnum(['USER', 'ADMIN'])
    role?: 'USER' | 'ADMIN';

    @IsOptional()
    suspended?: boolean;
}
