# AGENTS.md — Hospital Management System: Auth Module

Persistent context for any AI coding agent (Claude Code, etc.) working in this repo. Read this before making changes. If a request conflicts with anything marked **(fixed)** below, flag the conflict instead of silently complying.

## What this repo is

Authentication & authorization module for a multi-tenant Hospital Management System (HMS). One platform, many facility tenants, 15 staff/patient roles, health-data compliance posture (Kenya DPA 2019 / ODPC, Digital Health Act 2023).

Full design rationale: `docs/hms-auth-architecture.md`. Implementation brief: `docs/hms-auth-implementation-prompt.md`. This file is the day-to-day guardrails summary — those two are the "why."

## Stack

- **Backend**: Node.js, TypeScript, Express, Prisma ORM, PostgreSQL via Supabase (managed DB only), Zod
- **Frontend**: React, Vite, Tailwind CSS, React Hook Form + Zod resolvers, TanStack Query, Zustand
- **Auth**: fully in-house, no external provider — `argon2` (Argon2id) for passwords, `jose`/`jsonwebtoken` (RS256) for JWTs, `otplib` for TOTP MFA, own `Session` table for refresh-token rotation

## Fixed architectural rules — do not change without explicit sign-off

0. **No external auth provider.** Never store a plaintext password (Argon2id hash only) or a raw refresh token (SHA-256 hash only). JWT verification must explicitly allowlist the algorithm — reject `alg: none` and reject algorithm-confusion attempts. This code is the whole security boundary for credentials; treat any change to hashing, signing, or MFA logic as high-risk and call it out explicitly in the PR/response.
1. **RBAC is permission-based, never role-string based.** Authorization checks always test `resource:action` permissions (e.g. `invoice:approve`) against the DB-modeled `Role`/`Permission`/`RolePermission`/`UserRole` tables. Never write `if (user.role === 'doctor')` anywhere, backend or frontend.
2. **Tokens never leave httpOnly cookies.** No access/refresh token in localStorage, sessionStorage, Zustand, React Query cache, or any client-readable variable. The Zustand auth store holds only `{ userId, facilityId, roles, permissions, name }`.
3. **MFA verification is a distinct second step** (`/auth/mfa/verify`) after password check, never combined into one call.
4. **Postgres RLS is mandatory on every tenant-scoped table**, in addition to API-layer `facilityId` checks — never remove one because the other exists.
5. **Audit every**: auth events (login/logout/MFA/refresh/token-reuse), all role/permission grants, all `patient_record` reads (not just writes), and every 403 denial. `AuditLog` rows are append-only — no update/delete route for them, ever.
6. **MFA is mandatory (TOTP only, no SMS fallback)** for SuperAdmin, HospitalAdmin, all `*Manager` roles, Accountant, FinanceManager, Auditor. Doctor/Nurse get grace-period enforcement. Patient may use SMS OTP.
7. **Frontend permission checks are UX only.** Every gate shown in the UI must have a matching server-side `requirePermission` check — never ship a route guard without its backend counterpart.
8. **Zod schemas are shared**, not duplicated between frontend and backend. Put them in `packages/shared-schemas` (or equivalent shared path) and import from both sides.
9. **Department scoping is opt-in per resource, never a blanket authorization dimension.** `departmentId` exists on `User`/`UserRole` for reporting/audit; `requirePermission` does not filter by it unless a route explicitly opts in.

## Data model

Source of truth is `prisma/schema.prisma`. Core tables: `Facility`, `Department`, `User`, `Role`, `Permission`, `RolePermission`, `UserRole`, `Session`, `AuditLog`. `Facility` is self-referencing (`parentFacilityId`) — a hospital can have branches/satellite clinics under it; `Hospital Admin` grants do NOT cascade to branches by default (each facility needs its own `UserRole` grant). `Department` belongs to one `Facility`; `User`/`UserRole` may optionally reference one, but it's not used for authorization filtering by default — see §3.1 before changing this. See `docs/hms-auth-architecture.md` §3 for the full schema and rationale before altering any of these models.

Roles (15, fixed set unless a facility-custom-roles feature is explicitly requested): `SuperAdmin, HospitalAdmin, Doctor, Nurse, Receptionist, LabTech, PharmTech, Auditor, Accountant, FinanceManager, LabManager, PharmacyManager, RecordsOfficer, RecordsManager, Patient`.

Permission seed matrix lives in `prisma/seed.ts` — treat it as the canonical role→permission mapping; update it (not ad-hoc code) when permissions change.

## Conventions

- New API route touching any resource → must be paired with a `requirePermission(resource, action)` middleware call. No exceptions, including "internal" or "admin-only" routes — those still declare a permission.
- New domain table that's tenant-scoped → must ship with (a) a `facilityId` column, (b) an RLS policy migration, (c) tests confirming cross-tenant access is denied at the DB layer, not just the API layer.
- New frontend page/action gated by role → gate on a permission string via the shared `<RequirePermission resource action>` guard, not a role array.
- Any new form → Zod schema in the shared schemas package first, then wire to both the Express validator and the React Hook Form resolver from that one file.
- Sensitive reads (patient records especially) → call the audit logging helper explicitly in the controller; don't assume middleware catches it implicitly unless you've verified it does for that route.

## Explicitly out of scope right now

Don't build placeholders or speculative code for: SHA (Social Health Authority) integration, native mobile app auth, M-Pesa/billing integration. If a task seems to require one of these, stop and flag it rather than guessing at the interface.

## Commands

_(fill in once the project is scaffolded — placeholders below, update as real scripts land)_

```bash
npm run dev          # start API + web concurrently
npm run db:migrate   # prisma migrate dev
npm run db:seed      # prisma/seed.ts — roles + permissions
npm run test         # unit + integration tests
npm run test:rls     # RLS-specific cross-tenant isolation tests
```

## When something isn't covered here

Check `docs/hms-auth-architecture.md` (design rationale + ADRs) first. If it's genuinely a new decision, propose it and note it as a new ADR rather than deciding silently — this system handles health data across multiple facilities; undocumented judgment calls here are the kind of thing that turns into a compliance incident later.