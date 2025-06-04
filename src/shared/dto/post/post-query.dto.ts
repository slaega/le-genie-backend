import { Transform } from 'class-transformer';
import { IsBooleanString, IsNumberString, IsOptional } from 'class-validator';

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

    @IsOptional()
    @IsBooleanString()
    me?: string;
}
