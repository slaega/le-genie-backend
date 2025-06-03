import { IsNotEmpty, IsString } from 'class-validator';
import { PostParamDto } from '../post/post-param.dto';

export class ContributorParamDto extends PostParamDto {
    @IsString()
    @IsNotEmpty()
    contributorId: string;
}
