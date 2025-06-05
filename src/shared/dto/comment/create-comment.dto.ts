import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, ValidateIf } from 'class-validator';

export class CreateCommentDto {
    @ApiProperty()
    @ValidateIf((o) => {
        console.log('validate', o);
        return true;
    })
    @IsString()
    @IsNotEmpty()
    content: string;
}
