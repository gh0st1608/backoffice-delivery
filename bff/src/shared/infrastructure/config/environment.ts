export type Environment = {
  PORT: number;
  API_GATEWAY_URL: string;
};

export function validate(config: Record<string, unknown>): Environment {
  const gatewayUrl = config.API_GATEWAY_URL;
  if (typeof gatewayUrl !== 'string' || gatewayUrl === '') {
    throw new Error('Missing required environment variable: API_GATEWAY_URL');
  }
  if (!URL.canParse(gatewayUrl)) {
    throw new Error(`API_GATEWAY_URL is not a valid URL: ${gatewayUrl}`);
  }

  const port = Number(config.PORT ?? 4000);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error(
      `PORT must be an integer between 1 and 65535: ${String(config.PORT)}`,
    );
  }

  return { PORT: port, API_GATEWAY_URL: gatewayUrl };
}
