import { IsNumberString, IsOptional } from 'class-validator';

export class CommentQueryDto {
    @IsNumberString()
    @IsOptional()
    page?: string;

    @IsNumberString()
    @IsOptional()
    limit?: string;
}
