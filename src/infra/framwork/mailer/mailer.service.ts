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

        const from = process.env.MAIL_FROM ?? 'Le Génie <noreply@le-genie.com>';

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
        const appUrl =
            process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
        const unsubscribeUrl = `${appUrl}/newsletter/unsubscribe`;

        const html = this.baseLayout({
            title: `Nouveau post de ${authorName}`,
            previewText: `${authorName} vient de publier "${postTitle}"`,
            body: `
              <tr>
                <td style="padding:32px 40px 0;">
                  <p style="margin:0 0 8px;font-size:13px;font-weight:600;letter-spacing:1px;text-transform:uppercase;color:#6366f1;">
                    Nouvel article
                  </p>
                  <h1 style="margin:0 0 16px;font-size:26px;font-weight:700;line-height:1.3;color:#111827;">
                    ${this.escapeHtml(postTitle)}
                  </h1>
                  <p style="margin:0 0 28px;font-size:15px;line-height:1.7;color:#4b5563;">
                    <strong>${this.escapeHtml(authorName)}</strong> vient de publier un nouvel article sur Le Génie.
                    Ne manquez pas cette lecture !
                  </p>
                  <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 32px;">
                    <tr>
                      <td style="border-radius:8px;background:#6366f1;">
                        <a href="${postUrl}"
                           style="display:inline-block;padding:14px 28px;font-size:15px;font-weight:600;color:#fff;text-decoration:none;border-radius:8px;">
                          Lire l&rsquo;article &rarr;
                        </a>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            `,
            unsubscribeUrl,
        });

        await this.sendMail(
            to,
            `✨ ${authorName} a publié : ${postTitle}`,
            html
        );
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
        const appUrl =
            process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
        const unsubscribeUrl = `${appUrl}/newsletter/unsubscribe`;

        const postRows = posts
            .map(
                (p) => `
              <tr>
                <td style="padding:16px 0;border-bottom:1px solid #f3f4f6;">
                  <a href="${p.url}"
                     style="display:block;font-size:16px;font-weight:600;color:#111827;text-decoration:none;margin-bottom:4px;line-height:1.4;">
                    ${this.escapeHtml(p.title)}
                  </a>
                  <p style="margin:0;font-size:13px;color:#6b7280;">
                    Par <strong>${this.escapeHtml(p.authorName)}</strong>
                    &nbsp;&bull;&nbsp;
                    ${p.readingTime} min de lecture
                  </p>
                </td>
              </tr>
            `
            )
            .join('');

        const html = this.baseLayout({
            title: 'Le digest de la semaine',
            previewText: `${posts.length} article${posts.length > 1 ? 's' : ''} à ne pas manquer cette semaine`,
            body: `
              <tr>
                <td style="padding:32px 40px 0;">
                  <p style="margin:0 0 8px;font-size:13px;font-weight:600;letter-spacing:1px;text-transform:uppercase;color:#6366f1;">
                    Digest hebdomadaire
                  </p>
                  <h1 style="margin:0 0 8px;font-size:26px;font-weight:700;color:#111827;">
                    Les meilleurs articles de la semaine
                  </h1>
                  <p style="margin:0 0 28px;font-size:15px;color:#4b5563;">
                    ${posts.length} publication${posts.length > 1 ? 's' : ''} soigneusement sélectionnée${posts.length > 1 ? 's' : ''} pour vous.
                  </p>
                  <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                    ${postRows}
                  </table>
                  <table role="presentation" cellpadding="0" cellspacing="0" style="margin:28px 0 0;">
                    <tr>
                      <td style="border-radius:8px;background:#6366f1;">
                        <a href="${appUrl}/publications"
                           style="display:inline-block;padding:14px 28px;font-size:15px;font-weight:600;color:#fff;text-decoration:none;border-radius:8px;">
                          Voir toutes les publications &rarr;
                        </a>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            `,
            unsubscribeUrl,
        });

        await this.sendMail(to, '📚 Le Génie — Digest de la semaine', html);
    }

    async sendCommentNotification(opts: {
        postOwnerEmail: string;
        postOwnerName: string;
        commenterName: string;
        postTitle: string;
        postUrl: string;
    }): Promise<void> {
        const {
            postOwnerEmail,
            postOwnerName,
            commenterName,
            postTitle,
            postUrl,
        } = opts;
        const appUrl =
            process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

        const html = this.baseLayout({
            title: `Nouveau commentaire sur "${postTitle}"`,
            previewText: `${commenterName} a commenté votre article "${postTitle}"`,
            body: `
              <tr>
                <td style="padding:32px 40px 0;">
                  <p style="margin:0 0 8px;font-size:13px;font-weight:600;letter-spacing:1px;text-transform:uppercase;color:#6366f1;">
                    Nouveau commentaire
                  </p>
                  <h1 style="margin:0 0 16px;font-size:22px;font-weight:700;line-height:1.3;color:#111827;">
                    Bonjour ${this.escapeHtml(postOwnerName)} 👋
                  </h1>
                  <p style="margin:0 0 28px;font-size:15px;line-height:1.7;color:#4b5563;">
                    <strong>${this.escapeHtml(commenterName)}</strong> vient de commenter votre article
                    <strong>« ${this.escapeHtml(postTitle)} »</strong>.
                  </p>
                  <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 32px;">
                    <tr>
                      <td style="border-radius:8px;background:#6366f1;">
                        <a href="${postUrl}"
                           style="display:inline-block;padding:14px 28px;font-size:15px;font-weight:600;color:#fff;text-decoration:none;border-radius:8px;">
                          Voir le commentaire &rarr;
                        </a>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            `,
            unsubscribeUrl: `${appUrl}/me`,
        });

        await this.sendMail(
            postOwnerEmail,
            `💬 ${commenterName} a commenté "${postTitle}"`,
            html
        );
    }

    async sendOtpEmail(opts: { to: string; code: string }): Promise<void> {
        const { to, code } = opts;
        const html = this.baseLayout({
            title: 'Votre code de connexion',
            previewText: `Code de connexion Le Génie : ${code}`,
            body: `
          <tr>
            <td style="padding:32px 40px 0;">
              <p style="margin:0 0 8px;font-size:13px;font-weight:600;letter-spacing:1px;text-transform:uppercase;color:#6366f1;">
                Connexion sans mot de passe
              </p>
              <h1 style="margin:0 0 24px;font-size:22px;font-weight:700;line-height:1.3;color:#111827;">
                Votre code de connexion
              </h1>
              <p style="margin:0 0 24px;font-size:15px;line-height:1.7;color:#4b5563;">
                Utilisez ce code pour vous connecter à Le Génie.
                Il expire dans <strong>5 minutes</strong>.
              </p>
              <div style="background:#f3f4f6;border-radius:12px;padding:24px;text-align:center;margin:0 0 24px;">
                <span style="font-size:36px;font-weight:700;letter-spacing:12px;color:#111827;font-family:monospace;">
                  ${code}
                </span>
              </div>
              <p style="margin:0;font-size:13px;color:#9ca3af;">
                Si vous n'avez pas demandé ce code, ignorez cet email.
              </p>
            </td>
          </tr>
        `,
            unsubscribeUrl: '#',
        });
        await this.sendMail(to, '🔑 Votre code de connexion Le Génie', html);
    }

    // ─── Private helpers ──────────────────────────────────────────────────────

    private escapeHtml(str: string): string {
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    private baseLayout(opts: {
        title: string;
        previewText: string;
        body: string;
        unsubscribeUrl: string;
    }): string {
        const year = new Date().getFullYear();
        return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>${this.escapeHtml(opts.title)}</title>
  <!--[if mso]><noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript><![endif]-->
</head>
<body style="margin:0;padding:0;background-color:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">

  <!-- Preview text (hidden) -->
  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">
    ${this.escapeHtml(opts.previewText)}
    &nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;
  </div>

  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:#f9fafb;padding:32px 0;">
    <tr>
      <td align="center">
        <table role="presentation" cellpadding="0" cellspacing="0" width="600"
               style="max-width:600px;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background:#111827;padding:24px 40px;">
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td>
                    <span style="font-size:20px;font-weight:700;color:#ffffff;">
                      Le Génie<span style="color:#6366f1;">.</span>
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body -->
          ${opts.body}

          <!-- Divider -->
          <tr>
            <td style="padding:32px 40px 0;">
              <hr style="border:none;border-top:1px solid #e5e7eb;margin:0;" />
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 40px 32px;">
              <p style="margin:0;font-size:12px;color:#9ca3af;line-height:1.6;">
                Vous recevez cet email car vous êtes abonné à Le Génie.<br />
                <a href="${opts.unsubscribeUrl}"
                   style="color:#6366f1;text-decoration:underline;">
                  Se désabonner
                </a>
                &nbsp;&bull;&nbsp;
                &copy; ${year} Le Génie. Tous droits réservés.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
    }
}
