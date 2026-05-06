import {
    Body,
    Controller,
    Delete,
    HttpCode,
    HttpStatus,
    Inject,
    Post,
} from '@nestjs/common';
import { IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { SUBSCRIBER_REPOSITORY } from '#shared/constantes/inject-token';
import { SubscriberRepository } from '#domain/repository/subscriber.repository';

class SubscribeDto {
    @ApiProperty({ example: 'user@example.com' })
    @IsEmail()
    @IsNotEmpty()
    email: string;
}

@Controller('newsletter')
export class NewsletterController {
    constructor(
        @Inject(SUBSCRIBER_REPOSITORY)
        private readonly subscriberRepository: SubscriberRepository
    ) {}

    @Post('subscribe')
    @HttpCode(HttpStatus.OK)
    async subscribe(
        @Body() body: SubscribeDto
    ): Promise<{ success: boolean; message: string }> {
        await this.subscriberRepository.subscribe(body.email);
        return {
            success: true,
            message: 'Vous êtes maintenant abonné à la newsletter.',
        };
    }

    @Delete('unsubscribe')
    @HttpCode(HttpStatus.OK)
    async unsubscribe(
        @Body() body: SubscribeDto
    ): Promise<{ success: boolean; message: string }> {
        await this.subscriberRepository.unsubscribe(body.email);
        return {
            success: true,
            message: 'Vous avez été désabonné de la newsletter.',
        };
    }
}
