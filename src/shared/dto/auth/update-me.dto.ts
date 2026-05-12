import { IsOptional, IsString, IsUrl, MaxLength } from 'class-validator';

export class UpdateMeDto {
    @IsString() @IsOptional() @MaxLength(100)
    name?: string;

    @IsString() @IsOptional() @MaxLength(150)
    professionalRole?: string;

    @IsString() @IsOptional() @MaxLength(300)
    bio?: string;

    @IsString() @IsOptional() @MaxLength(5000)
    about?: string;

    @IsUrl({}, { message: 'Le site web doit être une URL valide' })
    @IsOptional()
    @MaxLength(2048)
    website?: string;

    @IsString() @IsOptional() @MaxLength(100)
    twitterHandle?: string;

    @IsString() @IsOptional() @MaxLength(100)
    githubHandle?: string;

    @IsString() @IsOptional() @MaxLength(150)
    location?: string;
}
