import { PostParamDto } from '../post/post-param.dto';
import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CommentParamDto extends PostParamDto {
    @ApiProperty({ type: 'string', default: 'cl7kg4rpz000051vgkwhle9rv' })
    @IsString()
    @IsNotEmpty()
    commentId: string;
}
