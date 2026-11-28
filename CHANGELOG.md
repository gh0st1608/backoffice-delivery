# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog 1.1.0](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- App shell with header, side navigation and main area in `src/shared/ui`. Every page renders inside it.
- Base theme tokens (colors, radii and font) in `globals.css`. They give the UI one shared palette.
- NestJS 11 BFF in `bff/`, registered as a pnpm workspace package. It sits between the frontend and the backend services.
- `GET /health` endpoint in the BFF returning `{ "status": "ok" }`. It lets us check that the service is up.
- Per-environment config in the BFF: `PORT` (default 4000), the four service URLs (`AUTH_SERVICE_URL`, `SHOP_SERVICE_URL`, `ORDER_SERVICE_URL`, `PAYMENT_SERVICE_URL`), `HTTP_TIMEOUT_MS`, `HTTP_GET_RETRY_DELAYS_MS` and `INTERNAL_API_KEY`. The BFF refuses to start if a required value is missing or fails validation.
- Namespaced settings in the BFF with `registerAs`: `services`, `http` and `apiKey`. They are typed and injected where needed, and the key stays apart from the other settings.
- `bff/.env.example` listing the BFF variables in sections. It documents what each environment must define.
- Per-service HTTP client in the BFF with a base URL for each service. Locally each service has its own port; in production all four can point to the API Gateway.
- Typed response envelopes in the client. It returns the content of `Data`; a missing or `null` `Data` returns `undefined` and logs a warning, and a success response that is not JSON becomes 502.
- Error catalog and one global exception filter in the BFF. Backend 4xx keep their status and `{ Error }` body (or get a generic one), 5xx and network errors become 502, and timeouts become 504. Internal causes are logged and never sent to the browser.
- Retries for `GET` requests in the client on 5xx, network errors and timeouts, one per delay in `HTTP_GET_RETRY_DELAYS_MS`, with `HTTP_TIMEOUT_MS` per attempt (200 ms and 400 ms, and 5 s, in the example file). Writes are never retried, so the client does not duplicate orders or payments.
- Auth headers in the client: `X-Internal-Api-Key` on every call and `Authorization: Bearer` when a user token is given. A 401 or 403 without a user token becomes 502, because it means the BFF's own key was rejected.
- "Run the BFF locally" section in `README.md`. It explains the local setup step by step.
- Architecture notes for `bff/` and code conventions in `CONTRIBUTING.md`. They keep new code aligned with the DDD layers and the code review rules.

### Changed

- Page language set to Spanish, title to "Foodstore Backoffice" and a short description added. This replaces the starter metadata.
- Home page reduced to an "Inicio" heading. It replaces the starter template page.
- Theme is light only. The template's dark mode styles and Arial font were dropped.

### Removed

- Starter template images in `public/`. Nothing in the app used them after the home page change.
- Geist font and its `next/font` loading. The theme now uses the system font stack.
