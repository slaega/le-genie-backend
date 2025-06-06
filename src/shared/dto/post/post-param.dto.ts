import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class PostParamDto {
    @ApiProperty({ type: 'string', default: '1' })
    @IsString()
    @IsNotEmpty()
    postId: string;
}
