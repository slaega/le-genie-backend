import 'dotenv/config';

import {
    ClassSerializerInterceptor,
    // ValidationPipe,
    VersioningType,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory, Reflector } from '@nestjs/core';
import { useContainer } from 'class-validator';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import * as requestIp from 'request-ip';

import { AppModule } from './app.module';

import { AllExceptionsFiltjer } from '#infra/framwork/common/filters/all-exceptions.filter';
import { PrismaExceptionFilter } from '#infra/framwork/common/filters/prisma-exception.filter';

import { LoggerErrorInterceptor } from 'nestjs-pino';
import { Environment } from '#config/app/app.config';
import { AllConfigType } from '#config/config.type';
import { SwaggerConfig } from '#config/swagger/swagger.config';
import { LoggerService } from '#infra/framwork/common/logger/logger.service';
import { ResolvePromisesInterceptor } from '#infra/framwork/common/serializer.interceptor';

import { appStart } from './app-start';
import validationOptions from '#infra/framwork/common/utils/validation-options';
import { CustomValidationPipe } from '#infra/framwork/common/utils/pipes/custom-validation.pipe';

async function bootstrap() {
    appStart();
    const app = await NestFactory.create(AppModule);
    const configService = app.get(ConfigService<AllConfigType>);
    const origin = configService.get('app.corsOrigins', { infer: true });
    app.enableCors({
        origin,
        credentials: true,
    });

    useContainer(app.select(AppModule), { fallbackOnErrors: true });

    // Configuration globale de la validation des classes
    app.useGlobalPipes(new CustomValidationPipe(validationOptions));

    // Configuration globale des intercepteurs et filtres
    app.useGlobalInterceptors(
        new ResolvePromisesInterceptor(),
        new ClassSerializerInterceptor(app.get(Reflector)),
        new LoggerErrorInterceptor()
    );
    app.useGlobalFilters(
        new AllExceptionsFilter(app.get(LoggerService)),
        new PrismaExceptionFilter()
    );

    // Configuration globale de sécurité
    app.use(helmet());
    // Configuration permettant de récupérer l'adresse IP du
    app.use(requestIp.mw());

    // Configuration globale de gestion des versions
    app.enableVersioning({
        type: VersioningType.URI,
        prefix: 'v',
        defaultVersion: '1.0',
    });

    // Configuration du préfixe global pour les routes de l'API
    app.setGlobalPrefix(
        configService.getOrThrow('app.apiPrefix', { infer: true }),
        {
            exclude: ['healthcheck', 'metrics'],
        }
    );

    // Configuration du logger global
    const logger = app.get(LoggerService);
    logger.setContext(configService.getOrThrow('app.name', { infer: true }));
    app.useLogger(logger);

    // Configuration de Swagger en dehors de l'environnement de production
    const env = configService.getOrThrow('app.nodeEnv', { infer: true });
    if (env !== Environment.Production) {
        SwaggerConfig(app);
    }

    // Configuration des cookies
    app.use(
        cookieParser(
            configService.getOrThrow('app.cookieSecret', { infer: true })
        )
    );

    // Démarrage du serveur
    const port = configService.getOrThrow('app.port', { infer: true });
    console.log('App Listing in ', port);
    await app.listen(port);
}

void bootstrap();
