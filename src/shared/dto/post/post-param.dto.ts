import { IsNotEmpty, IsString } from 'class-validator';

export class PostParamDto {
    @IsString()
    @IsNotEmpty()
    postId: string;
}
