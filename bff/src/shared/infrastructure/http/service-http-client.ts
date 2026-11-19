import { setTimeout as sleep } from 'node:timers/promises';
import {
  BadGatewayException,
  GatewayTimeoutException,
  HttpException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Environment } from '../config/environment';

export type Service = 'auth' | 'shop' | 'order' | 'payment';
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export type RequestOptions = {
  query?: Record<string, string | number | boolean | undefined>;
  body?: unknown;
};

const SERVICE_URL = {
  auth: 'AUTH_SERVICE_URL',
  shop: 'SHOP_SERVICE_URL',
  order: 'ORDER_SERVICE_URL',
  payment: 'PAYMENT_SERVICE_URL',
} as const satisfies Record<Service, keyof Environment>;

const TIMEOUT_MS = 5000;
// Waits before each retry; only GET is retried so writes are never duplicated.
const GET_RETRY_DELAYS_MS = [200, 400];

@Injectable()
export class ServiceHttpClient {
  private readonly logger = new Logger(ServiceHttpClient.name);

  constructor(private readonly config: ConfigService<Environment, true>) {}

  // `path` carries the full route (e.g. '/shop/products'); backends keep their prefix.
  async request<T = unknown>(
    service: Service,
    method: HttpMethod,
    path: string,
    options: RequestOptions = {},
  ): Promise<T> {
    const url = this.buildUrl(service, path, options.query);
    const init: RequestInit = {
      method,
      headers:
        options.body === undefined
          ? undefined
          : { 'Content-Type': 'application/json' },
      body:
        options.body === undefined ? undefined : JSON.stringify(options.body),
    };
    const retryDelays = method === 'GET' ? GET_RETRY_DELAYS_MS : [];

    for (let attempt = 0; ; attempt++) {
      const result = await this.send(url, init);
      if (result instanceof Response && result.ok) {
        return this.unwrap<T>(result);
      }
      if (result instanceof Response && result.status < 500) {
        throw await this.clientError(result);
      }
      // 5xx, network error or timeout
      if (attempt < retryDelays.length) {
        await sleep(retryDelays[attempt]);
        continue;
      }
      throw this.gatewayError(service, method, path, result);
    }
  }

  private async send(
    url: string,
    init: RequestInit,
  ): Promise<Response | Error> {
    try {
      return await fetch(url, {
        ...init,
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });
    } catch (error) {
      return error instanceof Error ? error : new Error(String(error));
    }
  }

  // Backend 4xx: same status and the backend's { Error: { title, message } } body.
  private async clientError(response: Response): Promise<HttpException> {
    const text = await response.text();
    try {
      const json: unknown = JSON.parse(text);
      if (json !== null && typeof json === 'object' && 'Error' in json) {
        return new HttpException(json, response.status);
      }
    } catch {
      // not JSON: fall through to the generic body
    }
    return new HttpException(
      {
        Error: {
          title: 'Request failed',
          message: `The service responded with status ${response.status}`,
        },
      },
      response.status,
    );
  }

  // 5xx or network failure -> 502; timeout -> 504. The cause is logged, never returned.
  private gatewayError(
    service: Service,
    method: HttpMethod,
    path: string,
    failure: Response | Error,
  ): HttpException {
    const reason =
      failure instanceof Response
        ? `status ${failure.status}`
        : `${failure.name}: ${failure.message}`;
    this.logger.error(`${method} ${service} ${path} failed: ${reason}`);

    if (failure instanceof Error && failure.name === 'TimeoutError') {
      return new GatewayTimeoutException({
        Error: {
          title: 'Gateway Timeout',
          message: `The ${service} service did not respond in time`,
        },
      });
    }
    return new BadGatewayException({
      Error: {
        title: 'Bad Gateway',
        message: `The ${service} service is unavailable`,
      },
    });
  }

  // Plain concatenation: `new URL(path, base)` would drop a base path such as an API Gateway stage.
  private buildUrl(
    service: Service,
    path: string,
    query: RequestOptions['query'],
  ): string {
    const base = this.config.get(SERVICE_URL[service], { infer: true });
    const url = new URL(`${base.replace(/\/$/, '')}${path}`);
    for (const [key, value] of Object.entries(query ?? {})) {
      if (value !== undefined) url.searchParams.set(key, String(value));
    }
    return url.toString();
  }

  // Backends answer { Data: ... }; empty or non-JSON bodies are returned as undefined / raw text.
  private async unwrap<T>(response: Response): Promise<T> {
    const text = await response.text();
    if (text === '') return undefined as T;
    try {
      const json: unknown = JSON.parse(text);
      return (
        json !== null && typeof json === 'object' && 'Data' in json
          ? json.Data
          : json
      ) as T;
    } catch {
      return text as T;
    }
  }
}
