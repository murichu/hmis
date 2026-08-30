# Implementation Prompt: HMS Authentication & Authorization Module

## Task

Build the authentication and authorization module for a multi-tenant Hospital Management System, backend and frontend, following the architecture below exactly. Ask me before deviating from any decision marked **(fixed)** — those are settled trade-offs, not defaults to reconsider. Where something is marked **(your call)**, use your judgment and note what you chose and why.

## Stack

- **Backend**: Node.js + TypeScript + Express + Prisma ORM + PostgreSQL via Supabase (used as managed DB only — Supabase Auth is not used; all authentication is in-house per decision 0), Zod for validation
- **Frontend**: React + Vite + Tailwind CSS + React Hook Form (+ Zod resolvers) + TanStack Query + Zustand
- **Auth**: fully in-house (fixed — no external auth provider). Use well-audited libraries, not hand-rolled crypto:
  - `argon2` for password hashing (Argon2id)
  - `jose` (preferred) or `jsonwebtoken` for JWT signing/verification, RS256, explicit algorithm allowlisting
  - `otplib` for TOTP MFA
  - Own `Session` table for refresh-token rotation (opaque random tokens, stored as SHA-256 hashes only)

## System context

- Multi-tenant: one platform, many facility tenants. A `SuperAdmin` operates across all facilities; a `Hospital Admin` is scoped to one.
- 15 roles: `SuperAdmin, HospitalAdmin, Doctor, Nurse, Receptionist, LabTech, PharmTech, Auditor, Accountant, FinanceManager, LabManager, PharmacyManager, RecordsOfficer, RecordsManager, Patient`.
- Compliance target: Kenya Data Protection Act 2019 / ODPC expectations, Digital Health Act 2023 — practically, this means: full audit trail of who accessed/changed what and when, and strict tenant data isolation.
- Out of scope for this module: SHA integration, native mobile app, billing/M-Pesa. Don't build placeholders for these — just don't block them architecturally.

## Non-negotiable design decisions (fixed)

0. **No external auth provider.** Password hashing, JWT issuance/verification, TOTP MFA, and refresh-token rotation are all implemented in this codebase using the libraries listed above. Supabase is used only as a managed Postgres instance — never as an auth provider or session validator. Never store a plaintext password or a raw refresh token (store `SHA-256(refresh_token)` only). Explicitly allowlist the JWT algorithm on verification (reject `alg: none`, reject any algorithm-confusion attempt). Implement login rate-limiting and account lockout (`failedLoginCount`/`lockedUntil` on `User`) — there is no external provider absorbing brute-force load.
1. **Permission-based RBAC, not role-string checks.** Model `Role`, `Permission` (`resource` + `action`), `RolePermission`, `UserRole` as real tables. Every authorization check tests a permission (`invoice:approve`), never a role name (`role === 'finance_manager'`). New roles/permissions must be addable via seed data, with zero code changes to the authorization logic itself.
2. **Tokens live only in httpOnly, secure, SameSite=Strict cookies**, set by the Express API. Never store access or refresh tokens in localStorage, sessionStorage, or any client-readable location. The Zustand store may only hold derived session state: `{ userId, facilityId, roles: string[], permissions: string[], name }` — no tokens.
3. **MFA is a separate verification step after password check**, not bundled into one call — issue a `challenge_id`, require a second `/auth/mfa/verify` call before any session cookie is set.
4. **Row-Level Security in Postgres as a second, independent enforcement layer** on every tenant-scoped table, in addition to (not instead of) API-layer `facilityId` checks in middleware.
5. **Every authorization denial (403) and every patient-record read is audit-logged**, not just writes and not just successes. Audit logs are append-only — no update/delete route ever exposed for them.
6. **MFA is mandatory** (not optional) for: SuperAdmin, HospitalAdmin, all `*Manager` roles, Accountant, FinanceManager, Auditor. TOTP only for these roles — no SMS fallback (SIM-swap risk on high-privilege accounts). Doctor/Nurse get a grace-period enforcement (`mfaEnforcedAt` deadline). Patients may enroll via SMS OTP as well as TOTP.
7. **Route guards on the frontend check permissions, not role names**, and are UX-only — every check they perform must be independently enforced server-side. Never trust a client-side gate as the actual control.
8. **Zod schemas for request/form validation are written once and imported by both backend (Express request validation) and frontend (React Hook Form resolvers)** — put these in a shared package/directory, not duplicated.
9. **Department scoping is opt-in per resource, not a blanket authorization dimension.** `departmentId` on `User`/`UserRole` is captured for reporting/audit, but `requirePermission` never filters by it automatically — don't add department-based data filtering anywhere unless explicitly asked.
10. **Patient self-registration must match against an existing patient record before the account is activated** — it does not create a fresh, unlinked identity. Verify against a hospital identifier (MRN) or national ID at registration time; the account is only usable (and only gains `own_record:read` over anything) once that match succeeds. This is the control that keeps self-registration from letting anyone claim to be an arbitrary patient and see that patient's records — treat it as part of the auth module's threat model, not a follow-up feature.

## Data model

Implement this Prisma schema (adapt field names only if there's a concrete Prisma/Postgres reason, and tell me why):

A facility can be a standalone hospital or have branches/satellite clinics under it — modeled as a self-referencing hierarchy, not a separate table. `User.facilityId` always points at the specific facility (branch or clinic) a person is tied to, never the parent. **Fixed for this pass**: `Hospital Admin` access does NOT cascade to branches — each facility, including branches, needs its own `UserRole` grant. `SuperAdmin` is the only cross-facility role. (This is a deliberate simplicity choice, not a limitation of the schema — the schema supports cascading later via `parentFacilityId` if that's needed.)

A facility also has departments (Radiology, Pediatrics, Laboratory, etc.) — modeled as their own `Department` table, scoped to one `Facility`. `User`/`UserRole` can optionally reference a department. **Fixed for this pass**: `departmentId` is captured for reporting/audit purposes and available as opt-in context per route, but `requirePermission` does NOT filter by department automatically — don't add department-based data filtering to a resource unless it's explicitly asked for (labs and pharmacy inventory are the obvious future candidates; general patient records should NOT be siloed by department, since a patient moves between departments during one visit).

Also add a `PatientVerification` (or equivalent) linkage — a table or fields recording which hospital patient identifier (MRN / national ID) a `Patient`-role `User` was matched against, and when. **(your call)** exact shape — a dedicated table (cleaner audit trail, supports re-verification history) vs. fields on `User` (simpler) are both fine; pick one and note why.

```prisma
enum FacilityType {
  HOSPITAL
  BRANCH
  SATELLITE_CLINIC
}

model Facility {
  id               String       @id @default(uuid())
  name             String
  type             FacilityType @default(HOSPITAL)
  parentFacilityId String?
  parentFacility   Facility?    @relation("FacilityHierarchy", fields: [parentFacilityId], references: [id])
  branches         Facility[]   @relation("FacilityHierarchy")
  isActive         Boolean      @default(true)
  createdAt        DateTime     @default(now())
  users       User[]
  departments Department[]
  auditLogs   AuditLog[]
  @@index([parentFacilityId])
}

model Department {
  id         String   @id @default(uuid())
  facilityId String
  facility   Facility @relation(fields: [facilityId], references: [id])
  name       String
  isActive   Boolean  @default(true)
  createdAt  DateTime @default(now())
  users User[]
  roles UserRole[]
  @@unique([facilityId, name])
  @@index([facilityId])
}

model User {
  id                 String    @id @default(uuid())
  facilityId         String?
  facility           Facility? @relation(fields: [facilityId], references: [id])
  departmentId       String?   // home/primary department — nullable
  department         Department? @relation(fields: [departmentId], references: [id])
  email              String?   @unique
  phone              String?   @unique
  fullName           String
  passwordHash       String    // Argon2id — never log or return this field
  isActive           Boolean   @default(true)
  mfaEnabled         Boolean   @default(false)
  mfaSecretEncrypted String?   // TOTP secret, envelope-encrypted at rest
  mfaEnforcedAt      DateTime?
  failedLoginCount   Int       @default(0)
  lockedUntil        DateTime?
  lastLoginAt        DateTime?
  patientVerifiedAt  DateTime? // set once patient identity match succeeds (Patient role only)
  createdAt          DateTime  @default(now())
  updatedAt          DateTime  @updatedAt
  roles         UserRole[]
  auditLogs     AuditLog[]
  sessions      Session[]
  @@index([facilityId])
}

model Role {
  id          String   @id @default(uuid())
  name        String   @unique
  description String?
  isSystem    Boolean  @default(true)
  permissions RolePermission[]
  users       UserRole[]
}

model Permission {
  id       String @id @default(uuid())
  resource String
  action   String
  roles    RolePermission[]
  @@unique([resource, action])
}

model RolePermission {
  roleId       String
  permissionId String
  role         Role       @relation(fields: [roleId], references: [id])
  permission   Permission @relation(fields: [permissionId], references: [id])
  @@id([roleId, permissionId])
}

model UserRole {
  id           String   @id @default(uuid())
  userId       String
  roleId       String
  facilityId   String
  departmentId String?  // optional — "Nurse, but only in Pediatrics"; null = facility-wide
  user         User     @relation(fields: [userId], references: [id])
  role         Role     @relation(fields: [roleId], references: [id])
  department   Department? @relation(fields: [departmentId], references: [id])
  grantedAt    DateTime @default(now())
  grantedBy    String?
  @@unique([userId, roleId, facilityId, departmentId])
  @@index([departmentId])
}

model Session {
  id               String    @id @default(uuid())
  userId           String
  user             User      @relation(fields: [userId], references: [id])
  refreshTokenHash String    @unique // SHA-256 hash — never store the raw refresh token
  familyId         String    // groups a rotation chain; reuse of a superseded hash = compromise signal
  ipAddress        String?
  userAgent        String?
  createdAt        DateTime  @default(now())
  lastSeenAt       DateTime  @default(now())
  expiresAt        DateTime
  revokedAt        DateTime?
  @@index([userId])
  @@index([familyId])
}

model AuditLog {
  id         String    @id @default(uuid())
  facilityId String?
  facility   Facility? @relation(fields: [facilityId], references: [id])
  userId     String?
  user       User?     @relation(fields: [userId], references: [id])
  action     String
  resource   String?
  ipAddress  String?
  userAgent  String?
  metadata   Json?
  createdAt  DateTime  @default(now())
  @@index([facilityId, createdAt])
  @@index([userId, createdAt])
}
```

## Seed data required

Create `prisma/seed.ts` that seeds all 15 roles and this permission matrix (extend granularity as you build out each resource, but preserve the intent of each row):

| Role | Permissions |
|---|---|
| SuperAdmin | `*:*` (all resources, all facilities) |
| HospitalAdmin | `*:*` scoped to own facility, `user:create`, `user:update`, `role:grant` |
| Doctor | `patient_record:read`, `patient_record:update`, `prescription:create`, `lab_order:create` |
| Nurse | `patient_record:read`, `patient_record:update` (vitals/notes fields), `vitals:create` |
| Receptionist | `appointment:create`, `appointment:update`, `patient_record:read` (demographics only) |
| LabTech | `lab_result:create`, `lab_result:update` (own orders only) |
| LabManager | `lab_result:*`, `lab_order:read`, `lab_tech:manage` |
| PharmTech | `prescription:read`, `dispense:create` |
| PharmacyManager | `prescription:*`, `inventory:*` |
| Auditor | `*:read` (own facility only), `audit_log:read` |
| Accountant | `invoice:create`, `invoice:read`, `payment:create` |
| FinanceManager | `invoice:*`, `payment:approve`, `financial_report:read` |
| RecordsOfficer | `patient_record:create`, `patient_record:read`, `patient_record:update` |
| RecordsManager | `patient_record:*`, `records_officer:manage` |
| Patient | `own_record:read`, `own_appointment:create`, `own_appointment:read` |

## API endpoints to build

- `POST /auth/register` — staff creation restricted to HospitalAdmin/SuperAdmin only (hashes the initial/temp password with Argon2id, forces reset on first login); patient self-registration is a separate, more open flow, gated by the identity-match requirement in decision 10 — the account is created in an unverified state and only receives `own_record:read` once matched against an existing MRN/national ID
- `POST /auth/login` — email/phone + password, Argon2id-verified against `passwordHash`; identical response whether the account exists or not; returns `{ mfa_required, challenge_id }` if MFA needed, otherwise sets cookies directly; increments `failedLoginCount`/applies lockout on failure
- `POST /auth/password/reset-request` / `POST /auth/password/reset` — single-use, short-lived signed reset token; never emails/SMSs a plaintext password
- `POST /auth/mfa/verify` — completes login, sets httpOnly cookies, creates `Session` row, writes `AuditLog(LOGIN_SUCCESS)`
- `POST /auth/mfa/enroll` — TOTP QR enrollment; SMS enrollment for Patient role
- `POST /auth/refresh` — rotates refresh token (detect and log reuse as `TOKEN_REUSE_DETECTED`, force-revoke session family on reuse)
- `POST /auth/logout` — revokes current session
- `GET /auth/sessions` — list active sessions for the current user ("log out other devices")
- `DELETE /auth/sessions/:id` — revoke a specific session
- `POST /users/:id/roles` — grant/revoke role, HospitalAdmin (own facility) / SuperAdmin only, audit-logged with `grantedBy`
- `GET /users/me` — current user + resolved roles + permissions

**(your call)** exact endpoint(s) for the patient identity-match step in decision 10 — could be a field on `/auth/register` itself (MRN + name/DOB submitted at signup) or a separate `POST /auth/patient/verify` called after account creation. Either is fine; pick one and note why.

## Middleware to build

1. `requireAuth` — verifies the RS256 JWT from the httpOnly cookie in-house (via `jose`, per decision 0), attaches `req.user`. Supabase is not involved in this check — it's DB-only.
2. `requirePermission(resource, action)` — checks the cached, resolved permission set for `req.user`, scoped to `req.user.facilityId`; on denial, writes `AuditLog(AUTHZ_DENIED)` and returns 403
3. Permission resolution caching — in-process LRU is fine to start (note in code comments that this needs to become Redis/pub-sub invalidated if this ever runs multi-instance); invalidate on any `UserRole` or `RolePermission` change
4. `setTenantContext` — sets `app.current_facility_id` via `SET LOCAL` at the start of each transaction for RLS
5. Audit logging middleware/helper — wrap patient-record read routes specifically, plus every auth event listed above

## Row-Level Security

Write the RLS migration for every tenant-scoped table (`User`, and every future domain table like `PatientRecord`, `Invoice`, etc. — start with `User`/`Session`/`AuditLog` now and document the pattern so it's applied to each domain table as it's added):

```sql
ALTER TABLE "<table>" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON "<table>"
  USING (facility_id = current_setting('app.current_facility_id')::uuid);
```

SuperAdmin access uses a Postgres role with `BYPASSRLS`, restricted to platform-admin-only endpoints.

## Frontend requirements

- Zustand store: session shape only (`userId, facilityId, roles, permissions, name`) — no tokens, ever
- TanStack Query: all server-state fetching; global response interceptor — on 401, attempt one silent refresh via the cookie-based `/auth/refresh` call and replay the original request once; on repeat 401, clear the store and redirect to `/login`
- Route guards: a `<RequirePermission resource="..." action="...">` wrapper component checking the Zustand-held permission set
- Login + MFA challenge UI as two distinct steps/screens
- Patient self-registration UI includes the identity-match step (decision 10) as part of the signup flow, with a clear "pending verification" state if the match doesn't resolve immediately
- Session management UI (list + revoke sessions) for the current user
- CSRF: implement double-submit cookie token on all state-changing requests
- Shared Zod schemas directory imported by both React Hook Form resolvers and Express request validators

## Deliverables, in order

1. Prisma schema + migration + seed script
2. RLS migration
3. In-house auth core: Argon2id password hashing/verification, RS256 JWT issuance/verification (explicit alg allowlisting), TOTP MFA (enroll/verify), refresh-token rotation with reuse detection, lockout/backoff logic
4. Express auth routes + middleware (`requireAuth`, `requirePermission`, audit logging, tenant context) wired to the auth core above, including the patient identity-match step from decision 10
5. Shared Zod validation schemas
6. React: Zustand auth store, TanStack Query hooks for auth endpoints, route guard component, login + MFA screens, patient self-registration/verification screen, session management screen
7. A short `README.md` covering local setup (Supabase DB connection string, JWT signing key generation, running migrations/seed, running both servers) and a note recommending an independent security review of the auth core before production

For each deliverable, show the code and briefly flag any place you deviated from the fixed decisions above or made a judgment call, so I can review before you move to the next one.