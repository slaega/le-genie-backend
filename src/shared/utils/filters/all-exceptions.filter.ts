import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ErrorResponseDto } from '../dto/error-response.dto';
import { LoggerService } from '#infra/framwork/common/logger/logger.service';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly logger: LoggerService) {
    this.logger.setContext(AllExceptionsFilter.name);
  }

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const errorResponse = new ErrorResponseDto(
      HttpStatus.INTERNAL_SERVER_ERROR,
      request.url,
    );
    if (exception instanceof HttpException) {
      errorResponse.statusCode = exception.getStatus();
      const responseErrors = exception.getResponse() as {
        errors?: any[];
      };
      if (responseErrors && responseErrors.errors) {
        errorResponse.errors = responseErrors.errors;
      }
    } else {
      errorResponse.statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
      errorResponse.errors.push({
        code: 'INTERNAL-SERVER-ERROR',
        message: 'Internal Server Error',
      });
    }

    response.status(errorResponse.statusCode).json(errorResponse);
  }
}
