import type { ServiceErrorResponse } from './service-http.types';

// Undefined when the service answered something other than its { Error } envelope.
export function parseErrorBody(text: string): ServiceErrorResponse | undefined {
  try {
    const body = JSON.parse(text) as ServiceErrorResponse | null;
    return body?.Error ? body : undefined;
  } catch {
    return undefined; // not JSON, e.g. an HTML page from a gateway
  }
}
