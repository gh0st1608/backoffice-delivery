import { setTimeout as sleep } from 'node:timers/promises';
import { Inject, Injectable, Logger } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { apiKeyConfig } from '../config/api-key.config';
import { httpConfig } from '../config/http.config';
import { servicesConfig } from '../config/services.config';
import { InternalCallRejectedException } from '../exceptions/internal-call-rejected.exception';
import { ServiceRequestFailedException } from '../exceptions/service-request-failed.exception';
import { ServiceTimeoutException } from '../exceptions/service-timeout.exception';
import { ServiceUnavailableException } from '../exceptions/service-unavailable.exception';
import { parseErrorBody } from './parse-error-body';
import type {
  HttpMethod,
  RequestOptions,
  Service,
  ServiceSuccessResponse,
} from './service-http.types';

@Injectable()
export class ServiceHttpClient {
  private readonly logger = new Logger(ServiceHttpClient.name);

  constructor(
    @Inject(servicesConfig.KEY)
    private readonly services: ConfigType<typeof servicesConfig>,
    @Inject(httpConfig.KEY)
    private readonly http: ConfigType<typeof httpConfig>,
    @Inject(apiKeyConfig.KEY)
    private readonly apiKey: ConfigType<typeof apiKeyConfig>,
  ) {}

  // `path` carries the full route (e.g. '/shop/products'); backends keep their prefix.
  async request<T = unknown>(
    service: Service,
    method: HttpMethod,
    path: string,
    options: RequestOptions = {},
  ): Promise<T | undefined> {
    const url = this.buildUrl(service, path, options.query);
    const headers: Record<string, string> = {
      'X-Internal-Api-Key': this.apiKey.internalApiKey,
    };
    if (options.body !== undefined)
      headers['Content-Type'] = 'application/json';
    if (options.accessToken) {
      headers.Authorization = `Bearer ${options.accessToken}`;
    }
    const init: RequestInit = {
      method,
      headers,
      body:
        options.body === undefined ? undefined : JSON.stringify(options.body),
    };
    // Only GET is retried so writes are never duplicated.
    const retryDelays = method === 'GET' ? this.http.retryDelaysMs : [];
    // It gets logged, so it holds no headers and nothing from options.query or the body.
    const call = `${method} ${service} ${path}`;

    for (let attempt = 0; ; attempt++) {
      const result = await this.send(url, init);
      if (result instanceof Response && result.ok) {
        return this.unwrap<T>(result, service, call);
      }
      if (result instanceof Response && result.status < 500) {
        if (!options.accessToken && [401, 403].includes(result.status)) {
          throw new InternalCallRejectedException(
            service,
            `${call} failed: status ${result.status}`,
          );
        }
        throw new ServiceRequestFailedException(
          result.status,
          parseErrorBody(await result.text()),
        );
      }
      // 5xx, network error or timeout
      if (attempt < retryDelays.length) {
        await sleep(retryDelays[attempt]);
        continue;
      }
      if (result instanceof Response) {
        throw new ServiceUnavailableException(
          service,
          `${call} failed: status ${result.status}`,
        );
      }
      const cause = `${call} failed: ${result.name}: ${result.message}`;
      throw result.name === 'TimeoutError'
        ? new ServiceTimeoutException(service, cause)
        : new ServiceUnavailableException(service, cause);
    }
  }

  private async send(
    url: string,
    init: RequestInit,
  ): Promise<Response | Error> {
    try {
      return await fetch(url, {
        ...init,
        signal: AbortSignal.timeout(this.http.timeoutMs),
      });
    } catch (error) {
      return error instanceof Error ? error : new Error(String(error));
    }
  }

  // Plain concatenation: `new URL(path, base)` would drop a base path such as an API Gateway stage.
  private buildUrl(
    service: Service,
    path: string,
    query: RequestOptions['query'],
  ): string {
    const base = this.services[service].url;
    const url = new URL(`${base.replace(/\/$/, '')}${path}`);
    for (const [key, value] of Object.entries(query ?? {})) {
      if (value !== undefined) url.searchParams.set(key, String(value));
    }
    return url.toString();
  }

  // An empty body is legitimate (204). A body without Data is not an error, but it is logged.
  private async unwrap<T>(
    response: Response,
    service: Service,
    call: string,
  ): Promise<T | undefined> {
    const text = await response.text();
    if (text === '') return undefined;
    let body: ServiceSuccessResponse<T> | null;
    try {
      body = JSON.parse(text) as ServiceSuccessResponse<T> | null;
    } catch {
      throw new ServiceUnavailableException(
        service,
        `${call} failed: status ${response.status} with a non-JSON body`,
      );
    }
    // A null Data counts as no data too; returning it would let null pass as a T.
    if (body?.Data == null) {
      this.logger.warn(`${call}: response without Data`);
      return undefined;
    }
    return body.Data;
  }
}
