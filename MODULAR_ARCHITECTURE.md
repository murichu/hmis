# HMIS Backend Architecture

The HMIS backend is a TypeScript modular monolith using Express, Prisma, PostgreSQL/Supabase, Zod, and Pino. Feature domains own their routes, controllers, services, repositories, schemas, and types. Cross-cutting infrastructure remains centralized.

## Implemented Foundation

```text
server/src/
├── app.ts                         Express application factory
├── server.ts                      Process bootstrap and graceful shutdown
├── config/                        Environment configuration
├── database/prisma.ts             Shared Prisma client
├── middlewares/                   Request ID, errors, and not-found handling
├── routes/index.ts                API v1 route registry
├── modules/audit/                 Append-only audit write service
├── logger.ts                      Pino structured logger
└── trace-context.ts               Request-scoped trace context
```

`app.ts` configures middleware, routes, and error handling but does not open a port. `server.ts` loads configuration, starts the HTTP server, and coordinates shutdown. This keeps application tests independent of network startup.

## Target Module Layout

```text
src/modules/<domain>/
├── <domain>.controller.ts         HTTP request and response handling
├── <domain>.service.ts            Business rules and orchestration
├── <domain>.repository.ts         Prisma data access
├── <domain>.routes.ts             Route definitions and middleware composition
├── <domain>.schema.ts             Zod schemas
├── <domain>.types.ts              Domain-specific types
├── <domain>.permissions.ts        Permission declarations when required
└── index.ts                       Public module exports
```

The primary domains are administration (`auth`, `users`, `roles`, `permissions`, `departments`), patient lifecycle (`patients`, `registrations`, `appointments`, `admissions`), clinical care, diagnostics, pharmacy, inventory, billing, payments, insurance, claims, reporting, audit, notifications, jobs, and integrations. Large domains such as laboratory and pharmacy may use nested modules.

## Request Flow

```text
Request -> trace ID -> security -> rate limit -> auth -> tenant context
-> permission check -> Zod validation -> controller -> service -> repository -> Prisma
```

All new protected routes require permission-based authorization. Roles are never checked directly. Tenant-scoped resources require both facility checks at the API layer and PostgreSQL RLS. Authentication tokens remain in httpOnly cookies.

## Auditing and Logging

Pino emits structured JSON logs, each containing a `traceId`. The same trace ID is returned in `X-Trace-Id` and `X-Request-Id` response headers. Audit records are append-only and written through `modules/audit`; they must capture security-relevant actions without storing credentials, tokens, or sensitive request payloads.

Audit authentication events, role and permission changes, all patient-record reads, and authorization denials. See `server/AGENTS.md` for the security requirements that govern every module.

## Routing and Database

`src/routes/index.ts` composes module routers below `/api/v1`. The legacy health endpoint remains available at `/api/health`; `/api/v1/health` is the versioned equivalent.

`prisma/schema.prisma` is the data-model source of truth. `src/database/prisma.ts` owns the only Prisma client instance. Repositories import that client; controllers and services do not instantiate Prisma clients.