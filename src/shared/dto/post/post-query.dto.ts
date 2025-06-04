import { Transform } from 'class-transformer';
import { IsNumberString, IsOptional } from 'class-validator';

export class PostQueryDto {
    @IsNumberString()
    @IsOptional()
    page?: string;

    @IsNumberString()
    @IsOptional()
    limit?: string;

    @IsOptional()
    @Transform(({ value }: { value: string }) => value.split(','))
    tags?: string[];

    @IsOptional()
    sort?: 'recent' | 'popular';
}
