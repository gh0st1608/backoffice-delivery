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
