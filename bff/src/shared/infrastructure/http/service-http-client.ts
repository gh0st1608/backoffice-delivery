import { Injectable } from '@nestjs/common';
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

@Injectable()
export class ServiceHttpClient {
  constructor(private readonly config: ConfigService<Environment, true>) {}

  // `path` carries the full route (e.g. '/shop/products'); backends keep their prefix.
  async request<T = unknown>(
    service: Service,
    method: HttpMethod,
    path: string,
    options: RequestOptions = {},
  ): Promise<T> {
    const response = await fetch(this.buildUrl(service, path, options.query), {
      method,
      headers:
        options.body === undefined
          ? undefined
          : { 'Content-Type': 'application/json' },
      body:
        options.body === undefined ? undefined : JSON.stringify(options.body),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });

    if (!response.ok) {
      throw new Error(`${service} service responded with ${response.status}`);
    }
    return this.unwrap<T>(response);
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
