# Proline

Minimal hello-world project with the same high-level shape as the source app:

- `apps/client`: Vite React client
- `apps/server`: NestJS API server
- `apps/server/prisma`: Prisma schema and client service

This scaffold intentionally does not include secrets, generated files, migrations, or copied business logic.

## Local Setup

Install dependencies from the project root:

```bash
npm install
```

Run the server:

```bash
npm run server:dev
```

Run the client:

```bash
npm run client:dev
```

The server listens on `http://localhost:3001` by default, and the client listens on `http://localhost:5174`.

## Database

The server includes a Postgres Docker Compose file at `apps/server/docker-compose.yml`.

From `apps/server`, start the database with:

```bash
npm run compose:up
```

Stop it with:

```bash
npm run compose:down
```

**You must keep this database running while using the API.** With Docker Desktop running, start Postgres (`compose:up`) *before* `npm run start` or `npm run server:dev`. If Prisma reports `Can't reach database server at localhost:5432`, Postgres is not listening—start the container or fix `DATABASE_URL` in `apps/server/.env`.

## Prisma

Copy `apps/server/.env.example` to `apps/server/.env`. The example `DATABASE_URL` matches the Docker Compose database:

```bash
postgresql://postgres:password@localhost:5432/proline?schema=public
```

No migrations are included in this hello-world scaffold.
