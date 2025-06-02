import { DatabaseService } from '@core/database/database.service';
import { MediaRefTypeEnum } from '@modules/medias/enums/media-ref-type.enum';
import { MediaRefTypeMapper } from '@modules/medias/mappers/media-ref-type.mapper';
import { Injectable } from '@nestjs/common';
import {
    registerDecorator,
    ValidationArguments,
    ValidationOptions,
    ValidatorConstraint,
    ValidatorConstraintInterface,
} from 'class-validator';
import { LoggerService } from '@core/logger/logger.service';

@Injectable()
@ValidatorConstraint({ name: 'MediaExistAndRefEqual', async: true })
export class MediaExistAndRefEqualConstraint
    implements ValidatorConstraintInterface
{
    constructor(
        private readonly prisma: DatabaseService,
        private readonly logger: LoggerService
    ) {}

    /**
     * Validation logic to check if the record exists in the database
     */
    async validate(value: string, args: ValidationArguments): Promise<boolean> {
        const [refValue] = args.constraints;

        if (value === undefined || !refValue) {
            return true;
        }
        try {
            const record = await this.prisma.mediaModel.findUnique({
                where: {
                    id: value,
                    mediaRefType: MediaRefTypeMapper.toModel(refValue),
                },
            });
            return record !== null;
        } catch (error) {
            if (error instanceof Error) {
                // Vérifie si l'erreur est une instance de Error
                this.logger.error(
                    `Error during existence validation: ${error.message}`,
                    error.stack,
                    MediaExistAndRefEqualConstraint.name,
                    error
                );
            } else {
                this.logger.error(
                    'Unexpected error during existence validation:',
                    null,
                    MediaExistAndRefEqualConstraint.name,
                    error
                );
            }
            return false;
        }
    }

    /**
     * Custom error message when validation fails
     */
    defaultMessage(args: ValidationArguments): string {
        return `Le champ ${args.property} n'existe pas dans la base de données ou ne correspond pas à la référence attendue.`;
    }
}

/**
 * Decorator to validate the existence of a value in the database
 */
export function MediaExistAndRefEqual(
    refValue: MediaRefTypeEnum, // Default to 'id' if no uniqueField is provided
    validationOptions?: ValidationOptions
) {
    return function (object: any, propertyName: string) {
        registerDecorator({
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            constraints: [refValue],
            validator: MediaExistAndRefEqualConstraint,
        });
    };
}
