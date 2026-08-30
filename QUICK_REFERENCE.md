# HMIS Backend Quick Reference

## Run Commands

```bash
cd server
npm run dev
npm run build
npm start
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

## Key Locations

| Need | Location |
| --- | --- |
| Configure Express | `server/src/app.ts` |
| Start the API | `server/src/server.ts` |
| Read environment | `server/src/config/env.ts` |
| Use Prisma | `server/src/database/prisma.ts` |
| Register API routes | `server/src/routes/index.ts` |
| Add request middleware | `server/src/middlewares/` |
| Write audit events | `server/src/modules/audit/` |
| Emit application logs | `server/src/logger.ts` |

## Add a Module

1. Create `server/src/modules/<domain>/` with controller, service, repository, routes, schema, types, and `index.ts`.
2. Keep HTTP handling in the controller and business rules in the service.
3. Keep Prisma access in the repository using the shared `prisma` client.
4. Register the router in `server/src/routes/index.ts` beneath `/api/v1`.
5. Add shared Zod schemas and permission middleware before exposing protected endpoints.
6. Add an explicit audit write for required security-sensitive events.

## Logging and Audit

Use `logger.info`, `logger.warn`, or `logger.error`. Every emitted log includes the active `traceId`; request logs also report method, path, status code, and duration. Use `writeAuditLog(event, request?)` from `modules/audit` for append-only compliance events. Do not include passwords, tokens, or raw clinical payloads in log or audit metadata.

## API Endpoints Available Today

- `GET /api/health`
- `GET /api/v1/health`

Feature endpoints are not available until their modules are implemented.