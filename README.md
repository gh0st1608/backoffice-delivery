# backoffice-delivery

Repository for the backoffice-delivery project.

## Run the BFF locally

Prerequisites:

- The `backend-delivery` repository cloned next to this one.
- Node.js and pnpm.

Steps:

1. Start the backend with `infra-delivery/local/up.sh --no-front`. It generates its own `INTERNAL_API_KEY` in each `backend-*/.env.local`.
2. Copy `bff/.env.example` to `bff/.env`.
3. In `bff/.env`, set the four service URLs to the local ports (auth `http://localhost:3000`, shop `http://localhost:3002`, order `http://localhost:3004`, payment `http://localhost:3005`). The example already has them.
4. Paste `INTERNAL_API_KEY` from `backend-order/.env.local` into `bff/.env`. Never commit it: `bff/.env` is ignored by Git.
5. Install dependencies with `pnpm install`.
6. Start the BFF with `pnpm --filter bff start:dev`.
7. Check it with `curl localhost:4000/health`, which should return `{"status":"ok"}`.

In production, every variable, including `INTERNAL_API_KEY`, comes from the secret environment variables of the hosting platform, never from a file.
