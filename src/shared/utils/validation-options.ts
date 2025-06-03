import {
    HttpStatus,
    UnprocessableEntityException,
    ValidationError,
    ValidationPipeOptions,
} from '@nestjs/common';
import { ValidationErrors } from './errors/validation.errors';
import { ErrorDto } from './dto/error.dto';

/**
 * Génère une liste d'objets d'erreur à partir d'une liste d'erreurs de validation.
 * @param {ValidationError[]} errors - Liste des erreurs de validation à traiter.
 * @returns {ErrorDto[]} Liste d'objets d'erreur formatés.
 */
function generateErrors(errors: ValidationError[]): ErrorDto[] {
    const constraintErrorMap: { [key: string]: string } = {
        INVALID: ValidationErrors.INVALID,
        ISNOTEMPTY: ValidationErrors.SHOULD_NOT_BE_EMPTY,
        ISSTRING: ValidationErrors.MUST_BE_STRING,
        ISEMAIL: ValidationErrors.MUST_BE_EMAIL,
        ISBOOLEAN: ValidationErrors.MUST_BE_BOOLEAN,
        ISINT: ValidationErrors.MUST_BE_INTEGER,
        ISNUMBER: ValidationErrors.MUST_BE_NUMBER,
        MIN: ValidationErrors.MUST_BE_MORE_THAN_MIN,
        MAX: ValidationErrors.MUST_BE_LESS_THAN_MAX,
        MAXLENGTH: ValidationErrors.MUST_BE_MAXLENGTH_CHARACTER_OR_LESS,
        MINLENGTH: ValidationErrors.MUST_BE_MINLENGTH_CHARACTER_OR_MORE,
        MATCHES: ValidationErrors.MUST_MATCH,
        ISNOTDISPOSABLEEMAIL: ValidationErrors.MUST_BE_DISPOSABLE,
        WHITELISTVALIDATION: ValidationErrors.MUST_BE_WHITELISTED,
    };

    return errors.reduce((accumulator: ErrorDto[], currentValue) => {
        if (currentValue.children && currentValue.children.length > 0) {
            const childErrors = generateErrors(currentValue.children);
            accumulator.push(...childErrors);
        } else {
            Object.entries(currentValue.constraints ?? {}).forEach(
                ([constraintName, constraintMessage]) => {
                    const code =
                        constraintErrorMap[constraintName.toUpperCase()] ??
                        ValidationErrors.INVALID;
                    accumulator.push({
                        code: code,
                        field: currentValue.property,
                        message: constraintMessage,
                    });
                }
            );
        }
        return accumulator;
    }, []);
}

/**
 * Fabrique une exception UnprocessableEntityException à partir des erreurs de validation.
 * @param {ValidationError[]} errors - Liste des erreurs de validation.
 * @returns {UnprocessableEntityException} Exception UnprocessableEntityException.
 */
function createUnprocessableEntityException(
    errors: ValidationError[]
): UnprocessableEntityException {
    return new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: generateErrors(errors),
    });
}

// Options de la pipe de validation
const validationOptions: ValidationPipeOptions = {
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
    forbidUnknownValues: true,
    errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
    exceptionFactory: createUnprocessableEntityException,
};

export default validationOptions;
