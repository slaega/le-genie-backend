import { Injectable, BadRequestException, HttpException, HttpStatus, Inject } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { MailerService } from '../mailer/mailer.service';
import * as bcrypt from 'bcrypt';
import { MAILER_SERVICE } from '#shared/constantes/inject-token';

const OTP_TTL_MS = 5 * 60 * 1000; // 5 minutes
const MAX_ATTEMPTS = 5;
const SEND_COOLDOWN_MS = 60 * 1000; // 1 minute entre 2 envois

@Injectable()
export class OtpService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(MAILER_SERVICE) private readonly mailer: MailerService,
  ) {}

  async sendOtp(email: string): Promise<void> {
    // Vérifie si un OTP non-utilisé et non-expiré existe depuis < 1 min (anti-spam)
    const recent = await this.prisma.otpCode.findFirst({
      where: {
        email,
        used: false,
        expiresAt: { gt: new Date() },
        createdAt: { gt: new Date(Date.now() - SEND_COOLDOWN_MS) },
      },
    });
    if (recent) {
      throw new HttpException('Un code a déjà été envoyé. Attendez 1 minute.', HttpStatus.TOO_MANY_REQUESTS);
    }

    // Invalide les anciens OTP pour cet email
    await this.prisma.otpCode.updateMany({
      where: { email, used: false },
      data: { used: true },
    });

    // Génère un code à 6 chiffres
    const rawCode = String(Math.floor(100000 + Math.random() * 900000));
    const hashedCode = await bcrypt.hash(rawCode, 10);

    await this.prisma.otpCode.create({
      data: {
        email,
        code: hashedCode,
        expiresAt: new Date(Date.now() + OTP_TTL_MS),
      },
    });

    await this.mailer.sendOtpEmail({ to: email, code: rawCode });
  }

  async verifyOtp(email: string, rawCode: string): Promise<boolean> {
    const otp = await this.prisma.otpCode.findFirst({
      where: {
        email,
        used: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!otp) throw new BadRequestException('Code invalide ou expiré.');

    // Incrémente les tentatives
    await this.prisma.otpCode.update({
      where: { id: otp.id },
      data: { attempts: { increment: 1 } },
    });

    if (otp.attempts + 1 >= MAX_ATTEMPTS) {
      await this.prisma.otpCode.update({ where: { id: otp.id }, data: { used: true } });
      throw new BadRequestException('Trop de tentatives. Demandez un nouveau code.');
    }

    const valid = await bcrypt.compare(rawCode, otp.code);
    if (!valid) throw new BadRequestException('Code incorrect.');

    await this.prisma.otpCode.update({ where: { id: otp.id }, data: { used: true } });
    return true;
  }
}
