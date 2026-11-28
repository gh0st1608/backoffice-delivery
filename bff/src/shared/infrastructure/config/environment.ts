export type Environment = {
  PORT: number;
  AUTH_SERVICE_URL: string;
  SHOP_SERVICE_URL: string;
  ORDER_SERVICE_URL: string;
  PAYMENT_SERVICE_URL: string;
  HTTP_TIMEOUT_MS: string;
  HTTP_GET_RETRY_DELAYS_MS: string;
  INTERNAL_API_KEY: string;
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

// Error messages name the variable but never include its value.
function requiredText(config: Record<string, unknown>, name: string): string {
  const value = config[name];
  if (typeof value !== 'string' || value.trim() === '') {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function requiredMatch(
  config: Record<string, unknown>,
  name: string,
  pattern: RegExp,
  expected: string,
): string {
  const value = requiredText(config, name);
  if (!pattern.test(value)) {
    throw new Error(`${name} must be ${expected}`);
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

  // Return every variable the config files read: a value that only lives in .env
  // reaches process.env only if it is returned here.
  return {
    PORT: port,
    AUTH_SERVICE_URL: requiredUrl(config, 'AUTH_SERVICE_URL'),
    SHOP_SERVICE_URL: requiredUrl(config, 'SHOP_SERVICE_URL'),
    ORDER_SERVICE_URL: requiredUrl(config, 'ORDER_SERVICE_URL'),
    PAYMENT_SERVICE_URL: requiredUrl(config, 'PAYMENT_SERVICE_URL'),
    HTTP_TIMEOUT_MS: requiredMatch(
      config,
      'HTTP_TIMEOUT_MS',
      /^\s*[1-9]\d*\s*$/,
      'a positive number of milliseconds',
    ),
    HTTP_GET_RETRY_DELAYS_MS: requiredMatch(
      config,
      'HTTP_GET_RETRY_DELAYS_MS',
      /^\s*\d+\s*(,\s*\d+\s*)*$/,
      'a comma-separated list of milliseconds, e.g. 200,400',
    ),
    INTERNAL_API_KEY: requiredText(config, 'INTERNAL_API_KEY'),
  };
}
