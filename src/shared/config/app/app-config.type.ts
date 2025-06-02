export type AppConfig = {
    nodeEnv: string;
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
    cookieSecret: string;
    redis: {
        host: string;
        port: number;
        username: string;
        password: string;
    };
};
