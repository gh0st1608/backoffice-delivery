# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog 1.1.0](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- App shell with header, side navigation and main area in `src/shared/ui`. Every page renders inside it.
- Base theme tokens (colors, radii and font) in `globals.css`. They give the UI one shared palette.
- NestJS 11 BFF in `bff/`, registered as a pnpm workspace package. It sits between the frontend and the backend services.
- `GET /health` endpoint in the BFF returning `{ "status": "ok" }`. It lets us check that the service is up.
- Per-environment config in the BFF: `PORT` (default 4000), the four service URLs (`AUTH_SERVICE_URL`, `SHOP_SERVICE_URL`, `ORDER_SERVICE_URL`, `PAYMENT_SERVICE_URL`) and `INTERNAL_API_KEY`. The BFF refuses to start if a required value is missing or invalid.
- `bff/.env.example` listing the BFF variables. It documents what each environment must define.
- Per-service HTTP client in the BFF with a base URL for each service. Locally each service has its own port; in production all four can point to the API Gateway.
- Service error mapping in the client: backend 4xx keep their status and body, 5xx and network errors become 502, and timeouts become 504. The browser gets one stable error shape and never sees internal causes.
- Retries for `GET` requests in the client: 2 retries after 200 ms and 400 ms, with a 5 s timeout per attempt. Writes are never retried, so orders and payments are not duplicated.
- Auth headers in the client: `X-Internal-Api-Key` on every call and `Authorization: Bearer` when a user token is given. A 401 or 403 without a user token becomes 502, because it means the BFF's own key was rejected.
- "Run the BFF locally" section in `README.md`. It explains the local setup step by step.
- Architecture notes for `bff/` in `CONTRIBUTING.md`. They keep the BFF aligned with the DDD layers.

### Changed

- Page language set to Spanish, title to "Foodstore Backoffice" and a short description added. This replaces the starter metadata.
- Home page reduced to an "Inicio" heading. It replaces the starter template page.
- Theme is light only. The template's dark mode styles and Arial font were dropped.

### Removed

- Starter template images in `public/`. Nothing in the app used them after the home page change.
- Geist font and its `next/font` loading. The theme now uses the system font stack.
