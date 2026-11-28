import { ArgumentsHost, Catch, ExceptionFilter, Logger } from '@nestjs/common';
import type { Response } from 'express';
import { InfrastructureException } from '../exceptions/infrastructure.exception';
import { ServiceRequestFailedException } from '../exceptions/service-request-failed.exception';

// The one place that turns catalog errors into responses and logs their cause.
@Catch(InfrastructureException)
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: InfrastructureException, host: ArgumentsHost): void {
    // Only gateway failures are logged; a relayed 4xx is an expected answer.
    if (exception.httpStatus >= 500) {
      this.logger.error(
        `${exception.constructor.name}: ${String(exception.cause)}`,
      );
    }
    const relayed =
      exception instanceof ServiceRequestFailedException
        ? exception.backendBody
        : undefined;
    host
      .switchToHttp()
      .getResponse<Response>()
      .status(exception.httpStatus)
      .json(
        relayed ?? {
          Error: { title: exception.title, message: exception.message },
        },
      );
  }
}
