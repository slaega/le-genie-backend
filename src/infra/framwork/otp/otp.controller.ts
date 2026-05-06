import {
    Body,
    Controller,
    HttpCode,
    Post,
    Inject,
    BadRequestException,
} from '@nestjs/common';
import { IsEmail, IsString, Length } from 'class-validator';
import { Throttle } from '@nestjs/throttler';
import { nanoid } from 'nanoid';
import { OtpService } from './otp.service';
import { PrismaService } from '../common/prisma/prisma.service';
import { TokenService } from '#infra/dependencies/token.service';
import { REFRESH_TOKEN_REPOSITORY } from '#shared/constantes/inject-token';
import { RefreshTokenRepository } from '#domain/repository/refresh-token.repository';
import { RefreshToken } from '#domain/entities/refresh-token.entity';

class SendOtpDto {
    @IsEmail()
    email: string;
}

class VerifyOtpDto {
    @IsEmail()
    email: string;

    @IsString()
    @Length(6, 6)
    code: string;
}

@Controller('auth/otp')
export class OtpController {
    constructor(
        private readonly otpService: OtpService,
        private readonly prisma: PrismaService,
        private readonly tokenService: TokenService,
        @Inject(REFRESH_TOKEN_REPOSITORY)
        private readonly refreshTokenRepo: RefreshTokenRepository
    ) {}

    /** POST /auth/otp/send — envoie un code OTP par email (3 req/min) */
    @Post('send')
    @HttpCode(200)
    @Throttle({ default: { limit: 3, ttl: 60000 } })
    async send(@Body() dto: SendOtpDto) {
        await this.otpService.sendOtp(dto.email);
        return { message: 'Code envoyé' };
    }

    /** POST /auth/otp/verify — vérifie le code et retourne des tokens JWT (10 req/min) */
    @Post('verify')
    @HttpCode(200)
    @Throttle({ default: { limit: 10, ttl: 60000 } })
    async verify(@Body() dto: VerifyOtpDto) {
        await this.otpService.verifyOtp(dto.email, dto.code);

        // Trouve ou crée l'utilisateur
        let user = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });
        if (!user) {
            const name = dto.email.split('@')[0];
            user = await this.prisma.user.create({
                data: { email: dto.email, name },
            });
        }

        if ((user as any).suspended) {
            throw new BadRequestException('Compte suspendu.');
        }

        // Génère les tokens (même flow que OAuth)
        const rawToken = nanoid(50);
        const role = (user as any).role ?? 'USER';
        const { accessToken, refreshToken } = this.tokenService.generateTokens(
            user.id,
            user.email,
            rawToken,
            role
        );

        // Persiste le refresh token
        const newRefresh = new RefreshToken();
        newRefresh.userId = user.id;
        newRefresh.token = refreshToken;
        await this.refreshTokenRepo.createRefreshToken(newRefresh);

        return { accessToken, refreshToken };
    }
}
