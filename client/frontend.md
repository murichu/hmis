Assuming React + Vite + TypeScript + Tailwind CSS + shadcn/ui + React Router + TanStack Query + Zod, this would be my production-grade structure.

Medcore HMS — Frontend Structure
medcore-hms/
│
├── client/
│   │
│   ├── public/
│   │   ├── favicon.ico
│   │   ├── logo.svg
│   │   └── assets/
│   │
│   ├── src/
│   │   │
│   │   ├── main.tsx
│   │   ├── App.tsx
│   │   ├── index.css
│   │   │
│   │   ├── assets/
│   │   │   ├── images/
│   │   │   ├── icons/
│   │   │   └── illustrations/
│   │   │
│   │   ├── app/
│   │   │   ├── router/
│   │   │   │   ├── index.tsx
│   │   │   │   ├── protected-route.tsx
│   │   │   │   ├── public-route.tsx
│   │   │   │   └── role-route.tsx
│   │   │   │
│   │   │   ├── providers/
│   │   │   │   ├── query-provider.tsx
│   │   │   │   ├── theme-provider.tsx
│   │   │   │   ├── auth-provider.tsx
│   │   │   │   └── app-provider.tsx
│   │   │   │
│   │   │   ├── layouts/
│   │   │   │   ├── auth-layout.tsx
│   │   │   │   ├── dashboard-layout.tsx
│   │   │   │   ├── clinical-layout.tsx
│   │   │   │   ├── administration-layout.tsx
│   │   │   │   └── blank-layout.tsx
│   │   │   │
│   │   │   └── config/
│   │   │       ├── navigation.ts
│   │   │       ├── routes.ts
│   │   │       └── permissions.ts
│   │   │
│   │   ├── components/
│   │   │   │
│   │   │   ├── ui/
│   │   │   │   ├── button.tsx
│   │   │   │   ├── input.tsx
│   │   │   │   ├── select.tsx
│   │   │   │   ├── dialog.tsx
│   │   │   │   ├── dropdown-menu.tsx
│   │   │   │   ├── table.tsx
│   │   │   │   ├── tabs.tsx
│   │   │   │   ├── badge.tsx
│   │   │   │   ├── card.tsx
│   │   │   │   ├── calendar.tsx
│   │   │   │   ├── tooltip.tsx
│   │   │   │   ├── sheet.tsx
│   │   │   │   └── ...
│   │   │   │
│   │   │   ├── layout/
│   │   │   │   ├── sidebar.tsx
│   │   │   │   ├── topbar.tsx
│   │   │   │   ├── breadcrumb.tsx
│   │   │   │   ├── page-header.tsx
│   │   │   │   ├── mobile-sidebar.tsx
│   │   │   │   └── command-menu.tsx
│   │   │   │
│   │   │   ├── data-display/
│   │   │   │   ├── data-table.tsx
│   │   │   │   ├── empty-state.tsx
│   │   │   │   ├── loading-state.tsx
│   │   │   │   ├── error-state.tsx
│   │   │   │   ├── status-badge.tsx
│   │   │   │   └── pagination.tsx
│   │   │   │
│   │   │   ├── forms/
│   │   │   │   ├── form-field.tsx
│   │   │   │   ├── search-input.tsx
│   │   │   │   ├── date-picker.tsx
│   │   │   │   ├── date-range-picker.tsx
│   │   │   │   └── file-upload.tsx
│   │   │   │
│   │   │   ├── feedback/
│   │   │   │   ├── confirm-dialog.tsx
│   │   │   │   ├── alert-dialog.tsx
│   │   │   │   ├── toast.tsx
│   │   │   │   └── error-boundary.tsx
│   │   │   │
│   │   │   └── common/
│   │   │       ├── logo.tsx
│   │   │       ├── avatar.tsx
│   │   │       ├── user-menu.tsx
│   │   │       ├── notification-bell.tsx
│   │   │       └── online-status.tsx
│   │   │
│   │   ├── features/
│   │   │   │
│   │   │   ├── auth/
│   │   │   │   ├── components/
│   │   │   │   │   ├── login-form.tsx
│   │   │   │   │   ├── register-form.tsx
│   │   │   │   │   ├── forgot-password-form.tsx
│   │   │   │   │   └── reset-password-form.tsx
│   │   │   │   ├── hooks/
│   │   │   │   │   ├── use-auth.ts
│   │   │   │   │   └── use-permissions.ts
│   │   │   │   ├── api/
│   │   │   │   │   └── auth.api.ts
│   │   │   │   ├── schemas/
│   │   │   │   │   └── auth.schema.ts
│   │   │   │   ├── types/
│   │   │   │   │   └── auth.types.ts
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   ├── dashboard/
│   │   │   │   ├── components/
│   │   │   │   │   ├── stats-card.tsx
│   │   │   │   │   ├── revenue-card.tsx
│   │   │   │   │   ├── patient-statistics.tsx
│   │   │   │   │   ├── appointment-overview.tsx
│   │   │   │   │   ├── bed-occupancy.tsx
│   │   │   │   │   ├── recent-patients.tsx
│   │   │   │   │   └── activity-feed.tsx
│   │   │   │   ├── hooks/
│   │   │   │   ├── api/
│   │   │   │   └── types/
│   │   │   │
│   │   │   ├── patients/
│   │   │   │   ├── components/
│   │   │   │   │   ├── patient-table.tsx
│   │   │   │   │   ├── patient-card.tsx
│   │   │   │   │   ├── patient-search.tsx
│   │   │   │   │   ├── patient-form.tsx
│   │   │   │   │   ├── patient-header.tsx
│   │   │   │   │   ├── patient-overview.tsx
│   │   │   │   │   ├── patient-identities.tsx
│   │   │   │   │   ├── patient-contacts.tsx
│   │   │   │   │   └── patient-timeline.tsx
│   │   │   │   ├── hooks/
│   │   │   │   ├── api/
│   │   │   │   ├── schemas/
│   │   │   │   ├── types/
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   ├── registrations/
│   │   │   ├── appointments/
│   │   │   ├── queues/
│   │   │   ├── admissions/
│   │   │   ├── wards/
│   │   │   ├── beds/
│   │   │   ├── triage/
│   │   │   ├── consultations/
│   │   │   ├── clinical-notes/
│   │   │   ├── diagnoses/
│   │   │   ├── procedures/
│   │   │   ├── care-plans/
│   │   │   ├── vital-signs/
│   │   │   ├── referrals/
│   │   │   ├── discharge/
│   │   │   │
│   │   │   ├── laboratory/
│   │   │   │   ├── components/
│   │   │   │   ├── pages/
│   │   │   │   ├── hooks/
│   │   │   │   ├── api/
│   │   │   │   ├── schemas/
│   │   │   │   ├── types/
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   ├── pharmacy/
│   │   │   │   ├── products/
│   │   │   │   ├── prescriptions/
│   │   │   │   ├── dispensing/
│   │   │   │   ├── sales/
│   │   │   │   ├── returns/
│   │   │   │   ├── stock/
│   │   │   │   ├── batches/
│   │   │   │   ├── suppliers/
│   │   │   │   ├── purchase-orders/
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   ├── inventory/
│   │   │   ├── billing/
│   │   │   ├── payments/
│   │   │   ├── insurance/
│   │   │   ├── claims/
│   │   │   ├── radiology/
│   │   │   ├── theatre/
│   │   │   ├── emergency/
│   │   │   ├── icu/
│   │   │   ├── maternity/
│   │   │   ├── physiotherapy/
│   │   │   ├── nutrition/
│   │   │   ├── mortuary/
│   │   │   ├── staff/
│   │   │   ├── users/
│   │   │   ├── roles/
│   │   │   ├── permissions/
│   │   │   ├── branches/
│   │   │   ├── departments/
│   │   │   ├── reports/
│   │   │   ├── notifications/
│   │   │   └── audit/
│   │   │
│   │   ├── pages/
│   │   │   │
│   │   │   ├── auth/
│   │   │   │   ├── login.page.tsx
│   │   │   │   ├── forgot-password.page.tsx
│   │   │   │   └── reset-password.page.tsx
│   │   │   │
│   │   │   ├── dashboard/
│   │   │   │   └── dashboard.page.tsx
│   │   │   │
│   │   │   ├── patients/
│   │   │   │   ├── patients.page.tsx
│   │   │   │   ├── patient-create.page.tsx
│   │   │   │   ├── patient-details.page.tsx
│   │   │   │   └── patient-edit.page.tsx
│   │   │   │
│   │   │   ├── registrations/
│   │   │   ├── appointments/
│   │   │   ├── admissions/
│   │   │   ├── triage/
│   │   │   ├── consultations/
│   │   │   ├── laboratory/
│   │   │   ├── pharmacy/
│   │   │   ├── billing/
│   │   │   ├── payments/
│   │   │   ├── insurance/
│   │   │   ├── claims/
│   │   │   ├── theatre/
│   │   │   ├── emergency/
│   │   │   ├── icu/
│   │   │   ├── maternity/
│   │   │   ├── reports/
│   │   │   ├── administration/
│   │   │   └── settings/
│   │   │
│   │   ├── services/
│   │   │   ├── api-client.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── storage.service.ts
│   │   │   ├── download.service.ts
│   │   │   └── print.service.ts
│   │   │
│   │   ├── hooks/
│   │   │   ├── use-debounce.ts
│   │   │   ├── use-pagination.ts
│   │   │   ├── use-mobile.ts
│   │   │   ├── use-print.ts
│   │   │   └── use-confirm.ts
│   │   │
│   │   ├── stores/
│   │   │   ├── auth.store.ts
│   │   │   ├── ui.store.ts
│   │   │   ├── sidebar.store.ts
│   │   │   └── patient.store.ts
│   │   │
│   │   ├── lib/
│   │   │   ├── axios.ts
│   │   │   ├── query-client.ts
│   │   │   ├── utils.ts
│   │   │   └── permissions.ts
│   │   │
│   │   ├── types/
│   │   │   ├── api.types.ts
│   │   │   ├── common.types.ts
│   │   │   ├── user.types.ts
│   │   │   └── navigation.types.ts
│   │   │
│   │   ├── constants/
│   │   │   ├── routes.ts
│   │   │   ├── roles.ts
│   │   │   ├── statuses.ts
│   │   │   └── permissions.ts
│   │   │
│   │   └── mocks/
│   │       ├── patients.mock.ts
│   │       ├── appointments.mock.ts
│   │       ├── billing.mock.ts
│   │       ├── pharmacy.mock.ts
│   │       ├── laboratory.mock.ts
│   │       └── dashboard.mock.ts
│   │
│   ├── tests/
│   │   ├── components/
│   │   ├── features/
│   │   ├── pages/
│   │   └── setup.ts
│   │
│   ├── .env
│   ├── .env.example
│   ├── eslint.config.js
│   ├── prettier.config.js
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── package.json
│   └── README.md
│
└── README.md
2. The key architectural decision

The frontend should have three distinct concepts:

pages/
features/
components/

They have different responsibilities.

Pages

Pages compose the screen.

pages/patients/patients.page.tsx

Example:

PatientsPage
 ├── PageHeader
 ├── PatientSearch
 ├── PatientFilters
 ├── PatientTable
 └── Pagination

The page should not contain all the patient business logic.

Features

Features contain domain-specific functionality.

features/patients/

For example:

features/patients/
├── components/
├── hooks/
├── api/
├── schemas/
├── types/
└── index.ts

This is where the patient-specific UI logic lives.

Components

Components are reusable across the entire application.

For example:

components/ui/data-table.tsx

can be used by:

Patients
Appointments
Billing
Pharmacy
Laboratory
Claims
Users
3. Feature structure

For most Medcore features, I'd standardize on:

features/
└── appointments/
    ├── components/
    │   ├── appointment-calendar.tsx
    │   ├── appointment-form.tsx
    │   ├── appointment-card.tsx
    │   ├── appointment-status.tsx
    │   └── appointment-details.tsx
    │
    ├── hooks/
    │   ├── use-appointments.ts
    │   ├── use-appointment.ts
    │   ├── use-create-appointment.ts
    │   └── use-cancel-appointment.ts
    │
    ├── api/
    │   └── appointments.api.ts
    │
    ├── schemas/
    │   └── appointment.schema.ts
    │
    ├── types/
    │   └── appointment.types.ts
    │
    └── index.ts

This creates a very predictable development experience.

4. Pharmacy should be more granular

Because Pharmacy is one of the larger HMS domains, don't put everything into:

features/pharmacy/

Instead:

features/pharmacy/
│
├── products/
│   ├── components/
│   ├── hooks/
│   ├── api/
│   └── types/
│
├── prescriptions/
│   ├── components/
│   ├── hooks/
│   └── api/
│
├── dispensing/
│   ├── components/
│   ├── hooks/
│   └── api/
│
├── sales/
│   ├── components/
│   ├── hooks/
│   └── api/
│
├── returns/
│   ├── components/
│   ├── hooks/
│   └── api/
│
├── stock/
│   ├── components/
│   ├── hooks/
│   └── api/
│
└── index.ts

This aligns well with the existing backend's pharmacy functionality, including sales, returns, dispensing, credit approval and reporting workflows.

5. Clinical workspace

The clinical side of the application should have a dedicated experience.

pages/
└── clinical/
    ├── clinical-dashboard.page.tsx
    ├── patient-worklist.page.tsx
    ├── consultation.page.tsx
    ├── patient-chart.page.tsx
    └── clinical-summary.page.tsx

And reusable clinical components:

features/
├── consultations/
├── clinical-notes/
├── diagnoses/
├── procedures/
├── vital-signs/
├── care-plans/
├── referrals/
└── discharge/

A doctor should be able to move through:

Patient
   ↓
Triage
   ↓
Consultation
   ↓
Diagnosis
   ↓
Orders
   ├── Laboratory
   ├── Radiology
   └── Pharmacy
   ↓
Treatment
   ↓
Follow-up / Admission / Discharge
6. Patient chart architecture

The patient chart is important enough to deserve its own shell.

pages/patients/
│
└── patient-details.page.tsx

Inside:

PatientChart
│
├── PatientHeader
│
├── PatientSummary
│
├── Tabs
│   ├── Overview
│   ├── Visits
│   ├── Consultations
│   ├── Diagnoses
│   ├── Medications
│   ├── Laboratory
│   ├── Radiology
│   ├── Procedures
│   ├── Admissions
│   ├── Billing
│   ├── Insurance
│   └── Documents
│
└── PatientTimeline

This gives clinicians a unified view instead of forcing them to navigate through unrelated screens.

7. Financial workspace

I'd separate financial pages from clinical pages.

pages/
└── billing/
    ├── billing-dashboard.page.tsx
    ├── invoices.page.tsx
    ├── invoice-details.page.tsx
    ├── payments.page.tsx
    ├── receipts.page.tsx
    ├── patient-statement.page.tsx
    ├── credit.page.tsx
    └── refunds.page.tsx

And:

features/
├── billing/
├── payments/
├── insurance/
└── claims/

This makes the frontend naturally support different roles:

Reception
    ↓
Registration

Clinician
    ↓
Clinical workspace

Pharmacist
    ↓
Pharmacy workspace

Cashier
    ↓
Billing workspace

Credit Officer
    ↓
Credit workspace

Claims Officer
    ↓
Claims workspace

Administrator
    ↓
Administration workspace
8. Mock-data architecture

Since you previously wanted the frontend to be developed using mock data, I'd make mocking a first-class concern rather than scattering hardcoded arrays throughout components.

Use:

src/mocks/

and eventually:

src/features/patients/api/
    patient.api.ts

The API layer can initially return mock data:

Component
    ↓
usePatients()
    ↓
patients.api.ts
    ↓
MOCK DATA

Later:

Component
    ↓
usePatients()
    ↓
patients.api.ts
    ↓
Express API

The UI doesn't need to change.

That's a very important architectural decision.

9. State management

Don't put everything into Zustand/global state.

Use:

TanStack Query

For server state:

patients
appointments
laboratory results
billing
pharmacy stock
claims
users
Zustand

For actual client state:

sidebar
theme
current patient context
UI preferences
modal state
React Hook Form + Zod

For forms:

Patient registration
Appointment creation
Consultation
Billing
Pharmacy
User management

So:

Server State
     │
TanStack Query
     │
     ▼
API

while:

Client State
     │
Zustand
     │
     ▼
UI
10. Routing

I'd make routes role-aware:

/app
│
├── dashboard
│
├── patients
│
├── registration
│
├── appointments
│
├── clinical
│
├── laboratory
│
├── pharmacy
│
├── billing
│
├── payments
│
├── insurance
│
├── claims
│
├── theatre
│
├── emergency
│
├── icu
│
├── maternity
│
├── reports
│
└── administration

Then permissions determine what the user can access.

For example:

RECEPTIONIST
    ├── Patients
    ├── Registration
    └── Appointments

DOCTOR
    ├── Patients
    ├── Appointments
    ├── Clinical
    └── Laboratory

PHARMACIST
    ├── Pharmacy
    └── Inventory

CASHIER
    ├── Billing
    ├── Payments
    └── Receipts

CREDIT_OFFICER
    ├── Billing
    ├── Credit
    └── Insurance

CLAIMS_OFFICER
    ├── Insurance
    ├── Claims
    └── Reports

ADMIN
    └── Everything
11. Final frontend architecture

The overall Medcore frontend becomes:

                         MEDCORE HMS
                              │
             ┌────────────────┴────────────────┐
             │                                 │
          APP SHELL                         FEATURES
             │                                 │
      ┌──────┼──────┐             ┌───────────┼───────────┐
      │      │      │             │           │           │
   Router Layout Providers      Clinical   Financial   Administration
      │      │      │             │           │           │
      │      │      │             │           │           │
      ▼      ▼      ▼             ▼           ▼           ▼
    Pages  Shell  State       Patients     Billing      Users
                              Triage       Payments     Roles
                              Consult      Claims       Branches
                              Lab          Insurance    Staff
                              Pharmacy
                              ICU
                              Theatre
                              Emergency
                              Maternity

And the dependency direction should be:

Pages
  ↓
Features
  ↓
Shared Components
  ↓
Services / API
  ↓
Backend

not the other way around.