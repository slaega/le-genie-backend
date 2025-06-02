import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AllConfigType } from '../config.type';

export const SwaggerConfig = (app: INestApplication<any>) => {
    const configService = app.get(ConfigService<AllConfigType>);
    const swaggerServerPath = configService.get('app.swaggerServerPath', {
        infer: true,
    });
    const documentBuilder = new DocumentBuilder()
        .setTitle('Focus API')
        .setContact(
            'Nanocreatives',
            'https://nanocreatives.com',
            'contact@nanocreatives.com'
        )
        .setDescription(
            'Focus App Microservice dedicated to User Management and Authentication'
        )
        .setVersion('0.0.1');
    swaggerServerPath.forEach((item) => {
        documentBuilder.addServer(item);
    });
    const config = documentBuilder.build();

    const document = SwaggerModule.createDocument(app, config);

    SwaggerModule.setup('internal/docs', app, document);
};
