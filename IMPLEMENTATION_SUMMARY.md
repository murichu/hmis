# HMIS Implementation Summary

## Implemented

- TypeScript Express application factory in `server/src/app.ts`.
- HTTP bootstrap and graceful shutdown handling in `server/src/server.ts`.
- Helmet, CORS, body parsing, cookie parsing, and global rate limiting.
- Pino structured logging with a trace ID on every log entry.
- Request trace headers: `X-Trace-Id` and `X-Request-Id`.
- Shared Prisma client at `server/src/database/prisma.ts`.
- API v1 route registry with `GET /api/v1/health`.
- Legacy health compatibility route: `GET /api/health`.
- Append-only audit logging service and repository at `server/src/modules/audit/`.
- Prisma schema and role/permission seed source.

## Architecture Status

The project has the platform foundation for a modular monolith. Business modules such as auth, users, patients, appointments, pharmacy, laboratory, billing, and claims are planned but not implemented. No documentation should imply these routes, controllers, or services currently exist.

## Required Implementation Rules

- Use controller -> service -> repository -> Prisma for domain functionality.
- Add every domain router to `src/routes/index.ts` beneath `/api/v1`.
- Validate request inputs with shared Zod schemas.
- Protect every resource route using `requirePermission(resource, action)` once auth middleware is implemented.
- Use the audit service for required auth, authorization, and patient-record events.
- Do not create a Prisma client outside `src/database/prisma.ts`.

## Validation

The server TypeScript build passes with `npm run build` from `server/`.