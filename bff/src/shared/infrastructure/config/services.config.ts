import { registerAs } from '@nestjs/config';

// Values are checked at startup by environment.ts.
export const servicesConfig = registerAs('services', () => ({
  auth: { url: process.env.AUTH_SERVICE_URL! },
  shop: { url: process.env.SHOP_SERVICE_URL! },
  order: { url: process.env.ORDER_SERVICE_URL! },
  payment: { url: process.env.PAYMENT_SERVICE_URL! },
}));
