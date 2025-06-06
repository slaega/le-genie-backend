import { Environment } from './app.config';

export type AppConfig = {
    nodeEnv: Environment;
    name: string;
    workingDirectory: string;
    frontendDomain?: string;
    backendDomain: string;
    port: number;
    apiPrefix: string;
    fallbackLanguage: string;
    headerLanguage: string;
    throttlerTtl: string | number;
    throttlerLimit: string | number;
    emailValidationEnabled: boolean;
    redis: {
        host: string;
        port: number;
        username: string;
        password: string;
    };
};
