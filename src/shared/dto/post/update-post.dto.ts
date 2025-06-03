import { IsArray, IsString } from 'class-validator';
export class UpdatePostDto {
    @IsString()
    title: string;
    @IsString()
    content: string;
    @IsArray()
    tags: string[];
}
