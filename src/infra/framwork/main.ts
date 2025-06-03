/* eslint-disable @typescript-eslint/no-unsafe-call */
import 'dotenv/config';

import {
  ClassSerializerInterceptor,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory, Reflector } from '@nestjs/core';
import { useContainer } from 'class-validator';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import * as requestIp from 'request-ip';

import { AppModule } from './app.module';

import { LoggerErrorInterceptor } from 'nestjs-pino';
import { AllConfigType } from '#config/config.type';
import { SwaggerConfig } from '#config/swagger/swagger.config';
import { LoggerService } from '#infra/framwork/common/logger/logger.service';
// import { appStart } from './app-start';
import { AllExceptionsFilter } from '#shared/utils/filters/all-exceptions.filter';
import { PrismaExceptionFilter } from '#shared/utils/filters/prisma-exception.filter';
import validationOptions from '#shared/utils/validation-options';
import { ResolvePromisesInterceptor } from '#shared/utils/serializer.interceptor';

async function bootstrap() {
  //   appStart();
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService<AllConfigType>);
  //   const origin = configService.get('app.corsOrigins', { infer: true });
  app.enableCors({
    origin: ['*'],
    credentials: true,
  });

  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  // Configuration globale de la validation des classes
  app.useGlobalPipes(new ValidationPipe(validationOptions));

  // Configuration globale des intercepteurs et filtres
  app.useGlobalInterceptors(
    new ResolvePromisesInterceptor(),
    new ClassSerializerInterceptor(app.get(Reflector)),
    new LoggerErrorInterceptor(),
  );
  app.useGlobalFilters(
    new AllExceptionsFilter(app.get(LoggerService)),
    new PrismaExceptionFilter(),
  );

  // Configuration globale de sécurité
  app.use(helmet());
  // Configuration permettant de récupérer l'adresse IP du
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  app.use(requestIp.mw());

  // Configuration globale de gestion des versions
  app.enableVersioning({
    type: VersioningType.URI,
    prefix: 'v',
    defaultVersion: '1.0',
  });

  // Configuration du préfixe global pour les routes de l'API
  const apiPrefix = configService.getOrThrow('app.apiPrefix', { infer: true });
  app.setGlobalPrefix(apiPrefix, {
    exclude: ['healthcheck', 'metrics'],
  });

  // Configuration du logger global
  const logger = app.get(LoggerService);
  logger.setContext(configService.getOrThrow('app.name', { infer: true }));
  app.useLogger(logger);

  // Configuration de Swagger en dehors de l'environnement de production
  SwaggerConfig(app);

  // Configuration des cookies
  app.use(
    cookieParser(configService.getOrThrow('app.cookieSecret', { infer: true })),
  );

  // Démarrage du serveur
  const port = configService.getOrThrow('app.port', { infer: true });
  console.log('App Listing in ', port);
  await app.listen(port);
}

void bootstrap();
