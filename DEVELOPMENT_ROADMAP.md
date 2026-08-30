# HMIS Development Roadmap

## Completed Platform Foundation

- [x] TypeScript and Express setup
- [x] App/server separation
- [x] Environment configuration foundation
- [x] Shared Prisma client
- [x] Helmet, CORS, rate limiting, cookie parsing
- [x] Pino structured logging with request trace IDs
- [x] Health endpoints and API v1 route registry
- [x] Append-only audit write foundation
- [x] Prisma core identity, role, session, and audit schema

## Priority 1: Identity and Access

- [ ] Implement Argon2id password hashing and RS256 JWT signing.
- [ ] Add auth routes: password check, distinct 2FA OTP verification, refresh rotation, logout, and sessions.
- [ ] Add permission-based `requireAuth` and `requirePermission` middleware.
- [ ] Add facility context and PostgreSQL RLS migrations/tests.
- [ ] Audit all authentication events, role/permission changes, 403 denials, and patient-record reads.
- [ ] Create shared Zod schemas usable by client and server.

## Priority 2: Administration and Patient Lifecycle

- [ ] Implement users, roles, permissions, departments, and facilities modules.
- [ ] Implement patients, registrations, appointments, queues, admissions, wards, and beds.
- [ ] Add unit, integration, and RLS isolation tests with fixtures.

## Priority 3: Clinical and Operational Domains

- [ ] Implement clinical, laboratory, radiology, pharmacy, inventory, billing, insurance, claims, reporting, and notifications domains.
- [ ] Add jobs for notifications, reports, claims, and reconciliation.
- [ ] Add OpenAPI documentation and standardized API responses.

## Priority 4: Production Operations

- [ ] Add containerization and CI/CD.
- [ ] Configure centralized log collection, alerts, backups, and disaster recovery.
- [ ] Add monitoring and performance tests.
- [ ] Document deployment and operational runbooks.

## Constraints

Do not add M-Pesa, SHA, or speculative external integrations until their requirements are explicitly approved. Follow the fixed security and authorization rules in `server/AGENTS.md`.