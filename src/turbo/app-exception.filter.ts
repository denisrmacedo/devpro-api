import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { QueryFailedError, EntityNotFoundError, CannotCreateEntityIdMapError } from 'typeorm';
import { Request, Response } from 'express';

@Catch()
export class AppExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const context = host.switchToHttp();
    const request = context.getRequest<Request>();
    const response = context.getResponse<Response>();
    var error = 'Internal Server Error';
    var message = exception.message;
    var code = 'HttpException';

    if (exception.response?.message) {
      message = exception.response?.message;
    }

    Logger.error(message, exception.stack, `${request.method} ${request.url}`);

    var status = HttpStatus.INTERNAL_SERVER_ERROR;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      error = exception.getResponse()['error'];
      code = exception.name;
    } else {
      switch (exception.constructor) {
        case HttpException:
          status = exception.getStatus();
          break;
        case QueryFailedError:
          status = HttpStatus.UNPROCESSABLE_ENTITY
          message = exception.message;
          code = exception.code;
          break;
        case EntityNotFoundError:
          status = HttpStatus.NOT_FOUND
          message = exception.message;
          code = exception.code;
          break;
        case CannotCreateEntityIdMapError:
          status = HttpStatus.UNPROCESSABLE_ENTITY
          message = exception.message;
          code = exception.code;
          break;
        default:
          status = HttpStatus.INTERNAL_SERVER_ERROR;
      }
    }

    response.status(status).send({
      status,
      message,
      code,
      error,
      path: request.originalUrl,
      timestamp: new Date().toISOString(),
    });
  }
}

export const GlobalResponseError: (statusCode: number, message: string, code: string, request: Request) => IResponseError = (
  statusCode: number,
  message: string,
  code: string,
  request: Request
): IResponseError => {
  return {
    statusCode: statusCode,
    message,
    code,
    timestamp: new Date().toISOString(),
    path: request.url,
    method: request.method
  };
};


export interface IResponseError {
  statusCode: number;
  message: string;
  code: string;
  timestamp: string;
  path: string;
  method: string;
}
