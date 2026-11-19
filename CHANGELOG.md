# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog 1.1.0](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- App shell with header, side navigation and main area in `src/shared/ui`. Every page renders inside it.
- Base theme tokens (colors, radii and font) in `globals.css`. They give the UI one shared palette.
- NestJS 11 BFF in `bff/`, registered as a pnpm workspace package. It will sit between the frontend and the API gateway.
- `GET /health` endpoint in the BFF returning `{ "status": "ok" }`. It lets us check that the service is up.
- Per-environment config in the BFF: `PORT` (default 4000) and `API_GATEWAY_URL` (required). The BFF refuses to start if a value is missing or invalid.
- `bff/.env.example` listing the BFF variables. It documents what each environment must define.
- Architecture notes for `bff/` in `CONTRIBUTING.md`. They keep the BFF aligned with the DDD layers.

### Changed

- Page language set to Spanish, title to "Foodstore Backoffice" and a short description added. This replaces the starter metadata.
- Home page reduced to an "Inicio" heading. It replaces the starter template page.
- Theme is light only. The template's dark mode styles and Arial font were dropped.

### Removed

- Starter template images in `public/`. Nothing in the app used them after the home page change.
- Geist font and its `next/font` loading. The theme now uses the system font stack.
