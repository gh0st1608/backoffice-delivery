# Contributing guide

## GitFlow

Permanent branches:

- `main`: production.
- `develop`: integration.

Temporary branches:

| Branch | Created from | Merged into |
|--------|--------------|-------------|
| `feature/<name>` | `develop` | `develop` (via PR) |
| `release/<x.y.z>` | `develop` | `main`, then `develop` |
| `hotfix/<name>` | `main` | `main` and `develop` |

Do not commit directly to `main` or `develop`.

## Commits

This project uses [Conventional Commits](https://www.conventionalcommits.org/): `type(optional scope): description`, in lowercase.

| Type | Use | SemVer effect |
|------|-----|---------------|
| `feat` | New feature | minor |
| `fix` | Bug fix | patch |
| `feat!` / `fix!` or `BREAKING CHANGE:` in the body | Breaking change | major |
| `docs` | Documentation | none |
| `style` | Formatting, no logic change | none |
| `refactor` | Restructuring without behavior change | none |
| `perf` | Performance improvement | none |
| `test` | Tests | none |
| `build` | Dependencies or build system | none |
| `ci` | Continuous integration | none |
| `chore` | Maintenance tasks | none |
| `revert` | Revert a commit | none |

Commits must not include co-authors (`Co-Authored-By`).

## Versioning

[SemVer](https://semver.org/) (`MAJOR.MINOR.PATCH`). The version lives in `package.json`.

## Architecture (DDD)

Code lives in `src/modules/<bounded-context>/` with four layers: `domain`, `application`, `infrastructure` and `presentation`. Shared code goes in `src/shared` and dependency composition in `src/di`.

Dependency rules:

- `domain` imports nothing.
- `application` imports only `domain`.
- `infrastructure` implements the ports defined in `domain`.
- `presentation` uses `application` through `di/`.
- `src/app` imports only from `modules/<context>/index.ts`.
- A module must not import the internal layers of another module.

### BFF (`bff/`)

The NestJS BFF follows the same layers inside `bff/src/modules/<context>/`:

- Controllers live in `presentation`.
- Each Nest `*.module.ts` plays the role of `di/`: it wires use cases and controllers.
- Use cases are plain classes registered with `useFactory`, so `application` still imports only `domain`.
- `bff/src/app.module.ts` imports modules only through their `index.ts`.
- Shared code goes in `bff/src/shared`.

## Code conventions

These rules come from code review and apply to every change.

1. **Error catalog by layers.** Each error is one class in its own file, under `<layer>/exceptions/`, and extends the base class of that layer. Services and clients only throw them. A single global filter turns them into HTTP responses and logs their cause. Exceptions have no numeric code of their own.
2. **Typed response envelopes.** The shapes other services send, such as `{ Data }` and `{ Error }`, are interfaces in their own file. Do not read them with generic `typeof` or `'Data' in` checks.
3. **Environment-dependent values.** URLs, timeouts, retry delays and keys come from environment variables (a `.env` file locally), are validated at startup and are read by `registerAs` config files grouped by hierarchy, such as `services.auth.url`. Do not add such constants, maps or enums to core files.
4. **Small core files.** Clients, services and use cases keep types, constants and error classes in separate files.

### Where exceptions live

- **Technical errors**, such as a failed call to another service (including a rejected internal call), go only in `bff/src/shared/infrastructure/exceptions/` and extend `InfrastructureException`.
- **Business errors** of a use case go in the `domain/exceptions/` folder of its module, `modules/<context>/`.
- The common base for business errors is created in `bff/src/shared/domain/exceptions/` with the first one. The global filter can then handle every context without importing from `modules/`.
- HTTP never appears in `domain`: a business error says what kind of failure it is, and the filter picks the HTTP status.
- The global filter lives in `bff/src/shared/infrastructure/filters/` and is registered with `APP_FILTER` in `app.module.ts`.
