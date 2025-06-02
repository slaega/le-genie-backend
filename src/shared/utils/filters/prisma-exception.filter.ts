import {
    ArgumentsHost,
    Catch,
    ExceptionFilter,
    HttpStatus,
} from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { ErrorResponseDto } from '@utils/dto/error-response.dto';
import { DatabaseErrors } from '@utils/errors/database.errors';
import { Request, Response } from 'express';

@Catch(PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
    catch(exception: PrismaClientKnownRequestError, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();
        const errorResponse = new ErrorResponseDto(
            HttpStatus.INTERNAL_SERVER_ERROR,
            request.url
        );

        if (exception.code === 'P2002') {
            // Conflit de contrainte unique
            errorResponse.statusCode = HttpStatus.BAD_REQUEST;
            errorResponse.errors.push({
                code: DatabaseErrors.CONFLICT,
                message: `Unique constraint failed on: ${exception.meta?.target}`,
            });
        } else if (exception.code === 'P2025') {
            // Enregistrement introuvable
            errorResponse.statusCode = HttpStatus.NOT_FOUND;
            errorResponse.errors.push({
                code: DatabaseErrors.NOT_FOUND,
                message: 'The requested record does not exist.',
            });
        } else if (exception.code === 'P2003') {
            // Clé étrangère inexistante (violation de contrainte de clé étrangère)
            errorResponse.statusCode = HttpStatus.BAD_REQUEST;
            errorResponse.errors.push({
                code: DatabaseErrors.FOREIGN_KEY_VIOLATION,
                message: 'The related record does not exist.',
            });
        } else {
            // Erreur générale de la base de données
            errorResponse.statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
            errorResponse.errors.push({
                code: DatabaseErrors.UNKNOWN_ERROR,
                message: 'Database Error',
            });
        }

        response.status(errorResponse.statusCode).json(errorResponse);
    }
}
