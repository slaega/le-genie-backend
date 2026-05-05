import { Global, Module } from '@nestjs/common';
import { MAILER_SERVICE } from '#shared/constantes/inject-token';
import { MailerService } from './mailer.service';

@Global()
@Module({
    providers: [{ provide: MAILER_SERVICE, useClass: MailerService }],
    exports: [MAILER_SERVICE],
})
export class MailerModule {}
