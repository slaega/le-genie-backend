import { AllConfigType } from '#config/config.type';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Handlebars from 'handlebars';
import fs from 'node:fs/promises';
import * as nodemailer from 'nodemailer';
import nodemailerSendgrid from 'nodemailer-sendgrid';
import { LoggerService } from '../logger/logger.service';

@Injectable()
export class MailerService {
  private readonly transporter: nodemailer.Transporter;

  constructor(
    private readonly configService: ConfigService<AllConfigType>,
    private readonly logger: LoggerService,
  ) {
    const apikeySendgrid = configService.get('mail.apikeySendgrid', {
      infer: true,
    });
    this.transporter = nodemailer.createTransport(
      apikeySendgrid
        ? nodemailerSendgrid({
            apiKey: apikeySendgrid,
          })
        : {
            host: configService.get('mail.host', { infer: true }),
            port: configService.get('mail.port', { infer: true }),
            ignoreTLS: configService.get('mail.ignoreTLS', {
              infer: true,
            }),
            secure: configService.get('mail.secure', { infer: true }),
            requireTLS: configService.get('mail.requireTLS', {
              infer: true,
            }),
            auth: {
              user: configService.get('mail.user', { infer: true }),
              pass: configService.get('mail.password', {
                infer: true,
              }),
            },
          },
    );
    Handlebars.registerHelper('splitOtp', function (str, separator) {
      return str.split(separator);
    });
    this.logger.setContext('MailerService');
  }

  async sendMail({
    templatePath,
    context,
    ...mailOptions
  }: nodemailer.SendMailOptions & {
    templatePath: string;
    context: Record<string, unknown>;
  }): Promise<void> {
    let html: string | undefined;

    if (templatePath) {
      const template = await fs.readFile(templatePath, 'utf-8');
      html = Handlebars.compile(template, {
        strict: true,
      })(context);
    }

    try {
      this.logger.info(
        `Start Mail Sending. Subject: ${mailOptions.subject} To:${mailOptions.to}`,
      );
      await this.transporter.sendMail({
        ...mailOptions,
        from: mailOptions.from
          ? mailOptions.from
          : `"${this.configService.get('mail.defaultName', {
              infer: true,
            })}" <${this.configService.get('mail.defaultEmail', {
              infer: true,
            })}>`,
        html: mailOptions.html ? mailOptions.html : html,
      });

      this.logger.info(
        `Email sent. Subject: ${mailOptions.subject} To:${mailOptions.to}`,
      );
    } catch (e) {
      this.logger.error(
        `An error occured while sending email. Subject: ${mailOptions.subject} To:${mailOptions.to}`,
        e instanceof Error ? e.stack : null,
        MailerService.name,
        e,
      );
    }
  }
}
