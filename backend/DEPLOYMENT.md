# Deploying LocaSpace

## Vercel fit

The Angular frontend is a good fit for Vercel, but this Spring Boot application is not a reliable fit for a serverless function with a 28-second startup deadline. Hibernate initialization and a cold remote MySQL connection can consume that budget by themselves. Lazy initialization only moves some work to the first request, and serverless-local H2 data and uploaded files are not durable.

Use a long-running container for the backend instead. Keep at least one instance running if cold-start latency matters. The repository's `frontend/vercel.json` configures only the frontend rewrites; `Dockerfile.vercel` does not turn the backend into a native Vercel function.

## Container deployment

`Dockerfile` builds the Spring Boot jar and runs it on the platform-provided `PORT` (default `8080`). Configure at least:

- `SPRING_DATASOURCE_URL`, `SPRING_DATASOURCE_USERNAME`, and `SPRING_DATASOURCE_PASSWORD`
- `SPRING_JPA_HIBERNATE_DDL_AUTO=validate` after applying the explicit database migrations
- `SPRING_SQL_INIT_MODE=never` (the default; do not seed production data)
- `CORS_ALLOWED_ORIGINS=https://sakane.vercel.app`

Use `/api/health` as the health check. If uploads must survive deployments, attach persistent storage at `/app/uploads` or replace local storage with object storage. Use MySQL rather than file-backed H2 in production.

### Railway

Create a service from this repository, select `backend/Dockerfile` (or use `backend` as the service root), add the environment variables above, and set the health-check path to `/api/health`. Keep one always-on replica and attach a volume at `/app/uploads` if needed.

### Render

Create a Docker Web Service with `backend` as the root directory. Set the same environment variables and health-check path. Attach a persistent disk at `/app/uploads` if needed, and avoid scale-to-zero for latency-sensitive traffic.

### Fly.io

From `backend/`, run `fly launch --dockerfile Dockerfile`, configure the environment/secrets, and deploy with `fly deploy`. Keep `min_machines_running = 1` to avoid cold starts and attach a volume at `/app/uploads` if needed.

For a fresh local H2 database only, bootstrap and seed it explicitly with `SPRING_JPA_HIBERNATE_DDL_AUTO=update` and `SPRING_SQL_INIT_MODE=always`. Optional local settings include `SPRING_H2_CONSOLE_ENABLED=true` and `SPRING_JPA_SHOW_SQL=true`.
