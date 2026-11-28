import { registerAs } from '@nestjs/config';

// Kept apart from the other settings so logging them can never print the key.
export const apiKeyConfig = registerAs('apiKey', () => ({
  internalApiKey: process.env.INTERNAL_API_KEY!,
}));
