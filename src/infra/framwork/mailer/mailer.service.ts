import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailerService {
    private readonly logger = new Logger(MailerService.name);
    private transporter: nodemailer.Transporter | null = null;

    private getTransporter(): nodemailer.Transporter | null {
        if (!process.env.MAIL_USER) {
            this.logger.warn(
                'MAIL_USER is not set — skipping email send silently'
            );
            return null;
        }

        if (!this.transporter) {
            this.transporter = nodemailer.createTransport({
                host: process.env.MAIL_HOST ?? 'smtp.gmail.com',
                port: Number(process.env.MAIL_PORT ?? 587),
                auth: {
                    user: process.env.MAIL_USER,
                    pass: process.env.MAIL_PASS,
                },
            });
        }

        return this.transporter;
    }

    async sendMail(
        to: string | string[],
        subject: string,
        html: string
    ): Promise<void> {
        const transport = this.getTransporter();
        if (!transport) return;

        const from =
            process.env.MAIL_FROM ?? 'Le Génie <noreply@le-genie.com>';

        try {
            await transport.sendMail({ from, to, subject, html });
        } catch (err) {
            this.logger.error(
                `Failed to send email. Subject: ${subject}`,
                err instanceof Error ? err.stack : err
            );
        }
    }

    async sendNewPostNotification(opts: {
        authorName: string;
        postTitle: string;
        postUrl: string;
        to: string[];
    }): Promise<void> {
        const { authorName, postTitle, postUrl, to } = opts;
        const html = `
<h2>Nouveau post de ${authorName}</h2>
<h3>${postTitle}</h3>
<a href="${postUrl}">Lire l'article →</a>
<p style="color:#999;font-size:12px">Pour vous désabonner, <a href="${postUrl}">cliquez ici</a>.</p>
`.trim();

        await this.sendMail(to, `Nouveau post : ${postTitle}`, html);
    }

    async sendWeeklyDigest(opts: {
        posts: Array<{
            title: string;
            url: string;
            authorName: string;
            readingTime: number;
        }>;
        to: string[];
    }): Promise<void> {
        const { posts, to } = opts;
        const items = posts
            .map(
                (p) =>
                    `<li><a href="${p.url}">${p.title}</a> — par ${p.authorName} (${p.readingTime} min)</li>`
            )
            .join('\n');

        const html = `
<h2>Le digest de la semaine</h2>
<ul>
${items}
</ul>
`.trim();

        await this.sendMail(to, 'Le digest de la semaine — Le Génie', html);
    }
}
