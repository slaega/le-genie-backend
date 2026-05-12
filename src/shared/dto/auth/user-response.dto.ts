import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
    @ApiProperty() id: string;
    @ApiProperty() email: string;
    @ApiProperty() name: string;
    @ApiProperty({ nullable: true }) avatarPath: string | null;
    @ApiProperty({ nullable: true }) coverPath: string | null;
    @ApiProperty({ nullable: true }) professionalRole: string | null;
    @ApiProperty({ nullable: true }) bio: string | null;
    @ApiProperty({ nullable: true }) about: string | null;
    @ApiProperty({ nullable: true }) website: string | null;
    @ApiProperty({ nullable: true }) twitterHandle: string | null;
    @ApiProperty({ nullable: true }) githubHandle: string | null;
    @ApiProperty({ nullable: true }) location: string | null;
    @ApiProperty() role: string;
    @ApiProperty() suspended: boolean;
    @ApiProperty() createdAt: string;
    @ApiProperty() updatedAt: string;
}
