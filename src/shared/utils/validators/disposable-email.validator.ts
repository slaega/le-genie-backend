import {
    ValidatorConstraint,
    ValidatorConstraintInterface,
    ValidationArguments,
} from 'class-validator';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { AllConfigType } from '#config/config.type';

@Injectable()
@ValidatorConstraint({ name: 'IsNotDisposableEmail', async: false })
export class IsNotDisposableEmail implements ValidatorConstraintInterface {
    constructor(private readonly configService: ConfigService<AllConfigType>) {}

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    validate(email: string, args: ValidationArguments) {
        const isEmailValidationEnabled = this.configService.getOrThrow(
            'app.emailValidationEnabled',
            {
                infer: true,
            }
        );

        if (!isEmailValidationEnabled) {
            // Si la validation des emails est désactivée dans la configuration, renvoie toujours vrai
            return true;
        }

        const domain = email.split('@')[1];

        // List of disposable email domains
        const disposableDomains = [
            'yopmail.com',
            'mailinator.com',
            'example.com',
        ];

        return !disposableDomains.includes(domain);
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    defaultMessage(args: ValidationArguments) {
        return 'The email address is disposable';
    }
}
