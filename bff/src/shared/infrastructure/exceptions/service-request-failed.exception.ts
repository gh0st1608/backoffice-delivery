import type { ServiceErrorResponse } from '../http/service-http.types';
import { InfrastructureException } from './infrastructure.exception';

// A backend 4xx: same status, and its { Error } body is relayed untouched.
export class ServiceRequestFailedException extends InfrastructureException {
  constructor(
    status: number,
    // Undefined when the answer had no { Error } body; the generic one is sent then.
    readonly backendBody?: ServiceErrorResponse,
  ) {
    super(
      'Request failed',
      `The service responded with status ${status}`,
      status,
    );
  }
}
