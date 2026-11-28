import { InfrastructureException } from './infrastructure.exception';

// A 5xx, a network failure or an answer that cannot be used.
export class ServiceUnavailableException extends InfrastructureException {
  constructor(service: string, cause: string) {
    super('Bad Gateway', `The ${service} service is unavailable`, 502, {
      cause,
    });
  }
}
