import { AppConfig } from './app/app-config.type';
import { AuthConfig } from './auth/auth-config.type';

export type AllConfigType = {
    app: AppConfig;
    auth: AuthConfig;
};
