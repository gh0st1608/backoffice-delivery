export type Environment = {
  PORT: number;
  AUTH_SERVICE_URL: string;
  SHOP_SERVICE_URL: string;
  ORDER_SERVICE_URL: string;
  PAYMENT_SERVICE_URL: string;
};

function requiredUrl(config: Record<string, unknown>, name: string): string {
  const value = config[name];
  if (typeof value !== 'string' || value === '') {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  if (!URL.canParse(value)) {
    throw new Error(`${name} is not a valid URL: ${value}`);
  }
  return value;
}

export function validate(config: Record<string, unknown>): Environment {
  const port = Number(config.PORT ?? 4000);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error(
      `PORT must be an integer between 1 and 65535: ${String(config.PORT)}`,
    );
  }

  return {
    PORT: port,
    AUTH_SERVICE_URL: requiredUrl(config, 'AUTH_SERVICE_URL'),
    SHOP_SERVICE_URL: requiredUrl(config, 'SHOP_SERVICE_URL'),
    ORDER_SERVICE_URL: requiredUrl(config, 'ORDER_SERVICE_URL'),
    PAYMENT_SERVICE_URL: requiredUrl(config, 'PAYMENT_SERVICE_URL'),
  };
}
