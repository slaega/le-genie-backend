import { AppConfig } from './app/app-config.type';
import { AuthConfig } from './auth/auth-config.type';
import { MailConfig } from './mail/mail-config.type';

export type AllConfigType = {
  app: AppConfig;
  auth: AuthConfig;
  mail: MailConfig;
};
