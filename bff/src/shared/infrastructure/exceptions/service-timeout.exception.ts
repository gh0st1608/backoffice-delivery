import { InfrastructureException } from './infrastructure.exception';

export class ServiceTimeoutException extends InfrastructureException {
  constructor(service: string, cause: string) {
    super(
      'Gateway Timeout',
      `The ${service} service did not respond in time`,
      504,
      { cause },
    );
  }
}
