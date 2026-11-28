import type { ConfigType } from '@nestjs/config';
import type { servicesConfig } from '../config/services.config';

export type Service = keyof ConfigType<typeof servicesConfig>;

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export type RequestOptions = {
  query?: Record<string, string | number | boolean | undefined>;
  body?: unknown;
  // The end user's token; omit it for internal calls made by the BFF itself.
  accessToken?: string;
};

// Wire shapes of the backend services.
export interface ServiceSuccessResponse<T> {
  Data: T;
}

export interface ServiceErrorResponse {
  Error: {
    title: string;
    message: string | string[];
    code?: number;
    status?: string;
    dateTime?: string;
  };
  Data?: null;
}
