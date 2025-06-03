import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { I18nContext } from 'nestjs-i18n';
import path from 'path';

import { MailData } from './interfaces/mail-data.interface';

import { AllConfigType } from '#config/config.type';
import { MailerService } from '../mailer/mailer.service';

@Injectable()
export class MailService {
    constructor(
        private readonly mailerService: MailerService,
        private readonly configService: ConfigService<AllConfigType>
    ) {}

    private async getTranslations(
        keys: string[],
        args: Record<string, any> = {}
    ): Promise<Record<string, string>> {
        const i18n = I18nContext.current();
        const translations = await Promise.all(
            keys.map((key) => i18n.t(key, { args }))
        );
        return Object.fromEntries(
            keys.map((key, index) => [
                key.split('.').pop(),
                translations[index],
            ])
        ) as Record<string, string>;
    }

    async sendSignupEmail(
        mailData: MailData<{
            otp: string;
            magicLinkToken: string;
            firstName: string;
        }>
    ): Promise<void> {
        const keys = [
            'signup-email.email_title',
            'signup-email.salutation',
            'signup-email.hi',
            'signup-email.welcome_message',
            'signup-email.instruction',
            'signup-email.code_expiration',
            'signup-email.alternative_title',
            'signup-email.alternative_text',
            'signup-email.activate_account',
            'signup-email.support_message_part1',
            'signup-email.support_message_part2',
            'signup-email.footer_warning',
            'common.email.thanks_for_your_trust',
            'common.email.team',
            'common.email.additional_support_offer_part1',
            'common.email.additional_support_offer_part2',
            'common.email.copyright',
        ];
        const translations = await this.getTranslations(keys, {
            firstName: mailData.data.firstName,
            year: new Date().getFullYear(),
        });

        const url = new URL(
            this.configService.getOrThrow('app.frontendDomain', {
                infer: true,
            }) + '/sign-up/verify'
        );
        url.searchParams.set('token', mailData.data.magicLinkToken);

        await this.mailerService.sendMail({
            to: mailData.to,
            subject: translations['email_title'],
            templatePath: path.join(
                this.configService.getOrThrow('app.workingDirectory', {
                    infer: true,
                }),
                'templates',
                'mail',
                'signup.hbs'
            ),
            context: {
                ...translations,
                otp: mailData.data.otp,
                magicLink: url.toString(),
            },
        });
    }

    async sendAccountActivationEmail(
        mailData: MailData<{
            otp: string;
            magicLinkToken: string;
            firstName: string;
        }>
    ): Promise<void> {
        const keys = [
            'account-activation-email.email_title',
            'account-activation-email.salutation',
            'account-activation-email.hi',
            'account-activation-email.instruction',
            'account-activation-email.code_expiration',
            'account-activation-email.alternative_title',
            'account-activation-email.alternative_text',
            'account-activation-email.activate_account',
            'account-activation-email.support_message_part1',
            'account-activation-email.support_message_part2',
            'account-activation-email.footer_warning',
            'common.email.thanks_for_your_trust',
            'common.email.team',
            'common.email.additional_support_offer_part1',
            'common.email.additional_support_offer_part2',
            'common.email.copyright',
        ];
        const translations = await this.getTranslations(keys, {
            firstName: mailData.data.firstName,
            year: new Date().getFullYear(),
        });

        const url = new URL(
            this.configService.getOrThrow('app.frontendDomain', {
                infer: true,
            }) + '/sign-up/verify'
        );
        url.searchParams.set('token', mailData.data.magicLinkToken);

        await this.mailerService.sendMail({
            to: mailData.to,
            subject: translations['email_title'],
            templatePath: path.join(
                this.configService.getOrThrow('app.workingDirectory', {
                    infer: true,
                }),
                'templates',
                'mail',
                'account-activation.hbs'
            ),
            context: {
                ...translations,
                otp: mailData.data.otp,
                magicLink: url.toString(),
            },
        });
    }

    async sendLoginEmail(
        mailData: MailData<{
            otp: string;
            magicLinkToken: string;
            firstName: string;
        }>
    ): Promise<void> {
        const keys = [
            'login-email.email_title',
            'login-email.salutation',
            'login-email.hi',
            'login-email.instruction',
            'login-email.code_expiration',
            'login-email.alternative_title',
            'login-email.alternative_text',
            'login-email.login_to_your_account',
            'login-email.footer_warning',
            'common.email.thanks_for_your_trust',
            'common.email.team',
            'common.email.additional_support_offer_part1',
            'common.email.additional_support_offer_part2',
            'common.email.copyright',
        ];
        const translations = await this.getTranslations(keys, {
            firstName: mailData.data.firstName,
            year: new Date().getFullYear(),
        });
        const url = new URL(
            this.configService.getOrThrow('app.frontendDomain', {
                infer: true,
            }) + '/login/verify'
        );
        url.searchParams.set('token', mailData.data.magicLinkToken);

        await this.mailerService.sendMail({
            to: mailData.to,
            subject: translations['email_title'],
            templatePath: path.join(
                this.configService.getOrThrow('app.workingDirectory', {
                    infer: true,
                }),
                'templates',
                'mail',
                'login.hbs'
            ),
            context: {
                ...translations,
                otp: mailData.data.otp,
                magicLink: url.toString(),
            },
        });
    }

    // TODO : A Developper

    async sendChangeEmailMail(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        mailData: MailData<{ name: string; oldEmail: string; token: string }>
    ): Promise<void> {}

    // TODO : A Developper

    async sendVerifyEmailMail(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        mailData: MailData<{ name: string; email: string; token: string }>
    ): Promise<void> {}
}
