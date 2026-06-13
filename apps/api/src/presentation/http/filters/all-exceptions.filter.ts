import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status: number;
    let message: string;
    let code: string | undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const body = exception.getResponse();
      message =
        typeof body === 'string'
          ? body
          : (body as Record<string, unknown>).message?.toString() ??
            exception.message;
      code = exception.constructor.name;
    } else if (exception instanceof Error) {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'Erro interno';
      code = 'InternalServerError';
      this.logger.error(exception.message, exception.stack);
    } else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'Erro interno';
      code = 'InternalServerError';
      this.logger.error('Unknown exception', String(exception));
    }

    const body: Record<string, unknown> = { success: false, error: message, code };

    if (process.env.NODE_ENV === 'development' && exception instanceof Error) {
      body.stack = exception.stack;
    }

    response.status(status).json(body);
  }
}
