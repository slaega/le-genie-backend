import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateMeDto {
    @IsString()
    @IsOptional()
    @MaxLength(100)
    name?: string;

    @IsString()
    @IsOptional()
    @MaxLength(150)
    professionalRole?: string;
}
