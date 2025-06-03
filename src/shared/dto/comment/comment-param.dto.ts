import { PostParamDto } from '../post/post-param.dto';
import { IsNotEmpty, IsString } from 'class-validator';

export class CommentParamDto extends PostParamDto {
  @IsString()
  @IsNotEmpty()
  commentId: string;
}
