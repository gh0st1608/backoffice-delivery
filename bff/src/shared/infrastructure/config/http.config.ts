import { registerAs } from '@nestjs/config';

// Values are checked at startup by environment.ts.
export const httpConfig = registerAs('http', () => ({
  timeoutMs: Number(process.env.HTTP_TIMEOUT_MS),
  retryDelaysMs: process.env.HTTP_GET_RETRY_DELAYS_MS!.split(',').map(Number),
}));
