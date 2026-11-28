import { InfrastructureException } from './infrastructure.exception';

function parseErrorBody(text: string): object | undefined {
  try {
    const json: unknown = JSON.parse(text);
    return json !== null && typeof json === 'object' && 'Error' in json
      ? json
      : undefined;
  } catch {
    return undefined; // not JSON
  }
}

// A backend 4xx: same status, and its { Error } body is relayed untouched.
export class ServiceRequestFailedException extends InfrastructureException {
  // Undefined when the answer had no { Error } body; the generic one is sent then.
  readonly backendBody?: object;

  constructor(status: number, rawBody: string) {
    super(
      'Request failed',
      `The service responded with status ${status}`,
      status,
    );
    this.backendBody = parseErrorBody(rawBody);
  }
}
