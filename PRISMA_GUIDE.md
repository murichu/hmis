# 📚 Prisma ORM Guide

Complete guide to using Prisma ORM with PostgreSQL in your HMIS project.

## 📋 Table of Contents

1. [What is Prisma?](#what-is-prisma)
2. [Installation & Setup](#installation--setup)
3. [Schema Definition](#schema-definition)
4. [Database Migrations](#database-migrations)
5. [CRUD Operations](#crud-operations)
6. [Relations](#relations)
7. [Advanced Queries](#advanced-queries)
8. [Best Practices](#best-practices)
9. [Performance Optimization](#performance-optimization)
10. [Troubleshooting](#troubleshooting)

---

## 🤔 What is Prisma?

**Prisma** is a modern ORM (Object-Relational Mapping) that simplifies database access:

- 📝 **Declarative Schema** - Define database structure in a simple DSL
- 🔄 **Type Safety** - Full TypeScript support with auto-generated types
- 🚀 **Intuitive API** - Simple, readable database queries
- 📊 **Migrations** - Version control for database changes
- 🔍 **SQL Inspection** - See the actual SQL queries generated
- 🛠️ **Developer Tools** - Prisma Studio for visual database management

**Key Benefits**:
- No string-based SQL (type-safe)
- Auto-completion in IDE
- Built-in migration system
- Works with PostgreSQL, MySQL, SQLite, and more

---

## 📦 Installation & Setup

### Step 1: Install Dependencies

```bash
cd server
npm install @prisma/client
npm install --save-dev prisma
```

### Step 2: Initialize Prisma

```bash
npx prisma init
```

This creates:
- `prisma/schema.prisma` - Your database schema
- `.env` - Environment variables file

### Step 3: Configure Database Connection

Update `server/.env`:

```env
# PostgreSQL connection string
DATABASE_URL="postgresql://postgres:password@localhost:5432/hmis_db"

# Or for Supabase
DATABASE_URL="postgresql://postgres:password@db.xyz.supabase.co:5432/postgres"
```

### Step 4: Generate Prisma Client

```bash
npx prisma generate
```

This creates type-safe database client code.

---

## 📝 Schema Definition

### Basic Schema Structure

The `prisma/schema.prisma` file defines your entire database structure:

```prisma
// Database configuration
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// Prisma client generation
generator client {
  provider = "prisma-client-js"
}

// Define your models (tables)
model User {
  id        Int     @id @default(autoincrement())
  email     String  @unique
  name      String
  password  String
  role      Role    @default(USER)
  
  // Relations
  patients Patient[]
  appointments Appointment[]
  
  // Timestamps
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  deletedAt DateTime?

  @@map("users")
}

enum Role {
  USER
  ADMIN
  DOCTOR
  NURSE
}
```

### Field Types

```prisma
model Example {
  // Scalars
  id        Int       @id @default(autoincrement())
  uuid      String    @id @default(uuid())
  email     String    @unique
  name      String
  age       Int
  height    Float
  isActive  Boolean   @default(true)
  
  // Dates
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
  birthDate DateTime
  
  // Optional fields (nullable)
  nickname  String?
  phone     String?
  
  // Lists
  tags      String[]
  
  // Large text
  bio       String    @db.Text
  
  // Decimal for precision
  salary    Decimal   @db.Decimal(10, 2)
}
```

### Field Attributes

```prisma
model User {
  // @id - Primary key
  id Int @id @default(autoincrement())
  
  // @unique - Unique constraint
  email String @unique
  
  // @default - Default value
  role String @default("user")
  
  // @updatedAt - Auto-update timestamp
  updatedAt DateTime @updatedAt
  
  // @db.* - Native database types
  bio String @db.Text
  
  // @ignore - Don't include in Prisma Client
  password String @ignore
  
  // Composite indexes
  @@unique([email, name])
  @@index([email])
}
```

### Relations

```prisma
model User {
  id Int @id @default(autoincrement())
  
  // One-to-Many: User has many Patients
  patients Patient[]
  
  // One-to-Many: User (doctor) has many Appointments
  appointments Appointment[] @relation("doctor")
}

model Patient {
  id Int @id @default(autoincrement())
  
  // Many-to-One: Patient belongs to User
  userId Int @unique
  user   User @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  // One-to-Many: Patient has many Appointments
  appointments Appointment[]
}

model Appointment {
  id Int @id @default(autoincrement())
  
  // Many-to-One: Appointment belongs to Patient
  patientId Int
  patient Patient @relation(fields: [patientId], references: [id], onDelete: Cascade)
  
  // Many-to-One: Appointment belongs to Doctor (User)
  doctorId Int?
  doctor User? @relation("doctor", fields: [doctorId], references: [id], onDelete: SetNull)
}

// Many-to-Many example
model Student {
  id Int @id @default(autoincrement())
  courses StudentCourse[]
}

model Course {
  id Int @id @default(autoincrement())
  students StudentCourse[]
}

model StudentCourse {
  studentId Int
  student Student @relation(fields: [studentId], references: [id])
  
  courseId Int
  course Course @relation(fields: [courseId], references: [id])
  
  @@id([studentId, courseId])
}
```

---

## 🔄 Database Migrations

### Create a Migration

After updating your `schema.prisma`, create a migration:

```bash
# Create migration with custom name
npx prisma migrate dev --name add_patient_table

# Create migration with auto-generated name
npx prisma migrate dev

# Create migration without applying it
npx prisma migrate dev --create-only
```

This:
1. Detects schema changes
2. Creates a migration file in `prisma/migrations/`
3. Applies the migration to your database
4. Regenerates Prisma Client

### Common Migration Commands

```bash
# View migration status
npx prisma migrate status

# Apply migrations to database
npx prisma migrate deploy

# Resolve migration issues
npx prisma migrate resolve --rolled-back migration_name

# Reset database (⚠️ WARNING: DELETES ALL DATA)
npx prisma migrate reset

# Diff against database (preview changes)
npx prisma migrate diff --from-schema-datasource --to-schema-file
```

### Migration Files

Migrations are SQL files created automatically:

```sql
-- prisma/migrations/20240830_add_patient_table/migration.sql

-- CreateTable
CREATE TABLE "patients" (
  "id" SERIAL NOT NULL PRIMARY KEY,
  "userId" INTEGER NOT NULL UNIQUE,
  "dateOfBirth" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "patients_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE
);
```

---

## 🔧 CRUD Operations

### Create (INSERT)

```typescript
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Create single record
const user = await prisma.user.create({
  data: {
    email: 'john@example.com',
    name: 'John Doe',
    password: 'hashed_password',
    role: 'USER',
  },
})

// Create with relations
const patient = await prisma.patient.create({
  data: {
    userId: user.id,
    dateOfBirth: new Date('1990-01-01'),
    user: {
      connect: { id: user.id },
    },
  },
  include: { user: true }, // Load related data
})

// Create multiple records
const users = await prisma.user.createMany({
  data: [
    { email: 'user1@example.com', name: 'User 1', password: 'hash1' },
    { email: 'user2@example.com', name: 'User 2', password: 'hash2' },
  ],
})
```

### Read (SELECT)

```typescript
// Find single record by ID
const user = await prisma.user.findUnique({
  where: { id: 1 },
})

// Find single record by unique field
const user = await prisma.user.findUnique({
  where: { email: 'john@example.com' },
})

// Find first record matching condition
const user = await prisma.user.findFirst({
  where: { role: 'DOCTOR' },
})

// Find many records
const users = await prisma.user.findMany({
  where: { role: 'DOCTOR' },
  orderBy: { createdAt: 'desc' },
  take: 10,        // Limit results
  skip: 0,         // Offset
})

// Select specific fields
const users = await prisma.user.findMany({
  select: {
    id: true,
    name: true,
    email: true,
  },
})

// Include related data
const user = await prisma.user.findUnique({
  where: { id: 1 },
  include: {
    patients: true,
    appointments: true,
  },
})
```

### Update (UPDATE)

```typescript
// Update single record
const user = await prisma.user.update({
  where: { id: 1 },
  data: {
    name: 'Jane Doe',
    email: 'jane@example.com',
  },
})

// Update or create (Upsert)
const user = await prisma.user.upsert({
  where: { email: 'john@example.com' },
  update: { name: 'John Updated' },
  create: {
    email: 'john@example.com',
    name: 'John New',
    password: 'hash',
  },
})

// Update many records
const result = await prisma.user.updateMany({
  where: { role: 'USER' },
  data: { role: 'DOCTOR' },
})
console.log(`Updated ${result.count} records`)
```

### Delete (DELETE)

```typescript
// Delete single record
const user = await prisma.user.delete({
  where: { id: 1 },
})

// Delete many records
const result = await prisma.user.deleteMany({
  where: { role: 'TEMP' },
})
console.log(`Deleted ${result.count} records`)

// Soft delete (update deletedAt field)
const user = await prisma.user.update({
  where: { id: 1 },
  data: { deletedAt: new Date() },
})
```

---

## 🔗 Relations

### One-to-One Relationship

```prisma
model User {
  id Int @id @default(autoincrement())
  profile UserProfile?
}

model UserProfile {
  id Int @id @default(autoincrement())
  userId Int @unique
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  bio String?
}
```

**Query:**
```typescript
// Get user with profile
const user = await prisma.user.findUnique({
  where: { id: 1 },
  include: { profile: true },
})

// Get profile with user
const profile = await prisma.userProfile.findUnique({
  where: { id: 1 },
  include: { user: true },
})
```

### One-to-Many Relationship

```prisma
model User {
  id Int @id @default(autoincrement())
  appointments Appointment[]
}

model Appointment {
  id Int @id @default(autoincrement())
  doctorId Int
  doctor User @relation(fields: [doctorId], references: [id], onDelete: Cascade)
}
```

**Query:**
```typescript
// Get user with all appointments
const user = await prisma.user.findUnique({
  where: { id: 1 },
  include: { appointments: true },
})

// Get appointment with doctor
const appointment = await prisma.appointment.findUnique({
  where: { id: 1 },
  include: { doctor: true },
})
```

### Many-to-Many Relationship

```prisma
model Student {
  id Int @id @default(autoincrement())
  courses StudentCourse[]
}

model Course {
  id Int @id @default(autoincrement())
  students StudentCourse[]
}

model StudentCourse {
  studentId Int
  student Student @relation(fields: [studentId], references: [id])
  courseId Int
  course Course @relation(fields: [courseId], references: [id])
  
  @@id([studentId, courseId])
}
```

**Query:**
```typescript
// Create association
await prisma.studentCourse.create({
  data: {
    studentId: 1,
    courseId: 1,
  },
})

// Get student with courses
const student = await prisma.student.findUnique({
  where: { id: 1 },
  include: {
    courses: {
      include: { course: true },
    },
  },
})

// Get course with students
const course = await prisma.course.findUnique({
  where: { id: 1 },
  include: {
    students: {
      include: { student: true },
    },
  },
})
```

---

## 🔍 Advanced Queries

### Where Conditions

```typescript
// Equal
where: { status: 'active' }

// Not equal
where: { status: { not: 'deleted' } }

// In list
where: { status: { in: ['active', 'pending'] } }

// Not in list
where: { status: { notIn: ['deleted'] } }

// Greater than
where: { age: { gt: 18 } }

// Greater than or equal
where: { age: { gte: 18 } }

// Less than
where: { age: { lt: 65 } }

// Less than or equal
where: { age: { lte: 65 } }

// Contains (string)
where: { name: { contains: 'John', mode: 'insensitive' } }

// Starts with
where: { email: { startsWith: 'admin@' } }

// Ends with
where: { email: { endsWith: '@example.com' } }

// Between dates
where: {
  createdAt: {
    gte: new Date('2024-01-01'),
    lte: new Date('2024-12-31'),
  },
}

// Combined conditions (AND)
where: {
  role: 'DOCTOR',
  createdAt: { gte: new Date('2024-01-01') },
}

// OR
where: {
  OR: [
    { email: 'john@example.com' },
    { email: 'jane@example.com' },
  ],
}

// Complex filters
where: {
  AND: [
    { role: 'DOCTOR' },
    { appointments: { some: { status: 'completed' } } },
  ],
}
```

### Aggregations

```typescript
// Count
const count = await prisma.user.count({
  where: { role: 'DOCTOR' },
})

// Aggregate
const stats = await prisma.appointment.aggregate({
  _count: true,
  _max: { appointmentDate: true },
  _min: { appointmentDate: true },
  _avg: { duration: true },
})

// Group by
const groupedUsers = await prisma.user.groupBy({
  by: ['role'],
  _count: true,
})
```

### Raw SQL Queries

```typescript
// Raw query (use carefully!)
const result = await prisma.$queryRaw`
  SELECT u.name, COUNT(a.id) as appointment_count
  FROM users u
  LEFT JOIN appointments a ON u.id = a.doctor_id
  GROUP BY u.id
`

// Execute raw SQL
await prisma.$executeRaw`
  UPDATE users SET role = 'ADMIN' WHERE email = 'admin@example.com'
`
```

### Transactions

```typescript
// Transaction (atomic operation)
const result = await prisma.$transaction(async (tx) => {
  // All operations succeed or all fail
  const user = await tx.user.create({
    data: { email: 'john@example.com', name: 'John', password: 'hash' },
  })
  
  const patient = await tx.patient.create({
    data: { userId: user.id, dateOfBirth: new Date() },
  })
  
  return { user, patient }
})

// Sequential transactions
const result = await prisma.$transaction([
  prisma.user.update({ where: { id: 1 }, data: { balance: { decrement: 100 } } }),
  prisma.user.update({ where: { id: 2 }, data: { balance: { increment: 100 } } }),
])
```

---

## ✨ Best Practices

### 1. Always Handle Connections

```typescript
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Disconnect after use
process.on('SIGINT', async () => {
  await prisma.$disconnect()
  process.exit(0)
})
```

### 2. Use Dependency Injection

```typescript
// Create singleton
const prismaDb = new PrismaClient()

export default prismaDb

// Use in controllers
import prisma from '../services/database.service'

const user = await prisma.user.findUnique({ where: { id: 1 } })
```

### 3. Error Handling

```typescript
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'

try {
  await prisma.user.create({
    data: { email: 'john@example.com', name: 'John', password: 'hash' },
  })
} catch (error) {
  if (error instanceof PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      // Unique constraint violation
      console.error('Email already exists')
    }
  }
  throw error
}
```

### 4. Select Only Needed Fields

```typescript
// ❌ Bad - Fetches all fields including sensitive data
const users = await prisma.user.findMany()

// ✅ Good - Select only needed fields
const users = await prisma.user.findMany({
  select: {
    id: true,
    name: true,
    email: true,
  },
})
```

### 5. Use Pagination

```typescript
// ❌ Bad - Fetches all records
const users = await prisma.user.findMany()

// ✅ Good - Pagination
const page = 1
const pageSize = 20

const users = await prisma.user.findMany({
  skip: (page - 1) * pageSize,
  take: pageSize,
  orderBy: { createdAt: 'desc' },
})

// Count total for pagination
const total = await prisma.user.count()
const totalPages = Math.ceil(total / pageSize)
```

### 6. Use Relations Efficiently

```typescript
// ❌ Bad - N+1 problem
const patients = await prisma.patient.findMany()
for (const patient of patients) {
  const appointments = await prisma.appointment.findMany({
    where: { patientId: patient.id },
  })
}

// ✅ Good - Single query with relations
const patients = await prisma.patient.findMany({
  include: { appointments: true },
})
```

### 7. Add Database Indexes

```prisma
model User {
  id Int @id @default(autoincrement())
  email String @unique
  name String
  
  // Add index for frequently queried field
  @@index([createdAt])
  
  // Composite index
  @@index([email, name])
}
```

---

## 📈 Performance Optimization

### Query Optimization

```typescript
// Enable logging to see generated SQL
const prisma = new PrismaClient({
  log: ['query', 'error', 'warn'],
})

// Profile queries
const start = Date.now()
const users = await prisma.user.findMany()
console.log(`Query took ${Date.now() - start}ms`)
```

### Database Indexes

```prisma
// Single column index
model User {
  id Int @id @default(autoincrement())
  email String @unique
  createdAt DateTime @default(now())
  
  @@index([createdAt])
}

// Composite index
model Appointment {
  id Int @id @default(autoincrement())
  patientId Int
  doctorId Int
  status String
  
  @@index([patientId, doctorId])
}
```

### Connection Pooling

For production, use connection pooling:

```env
# Supabase with connection pooling
DATABASE_URL="postgresql://postgres:password@db.xyz.supabase.co:6543/postgres?schema=public"
```

---

## 🐛 Troubleshooting

### Common Errors

**P2002: Unique constraint violation**
```typescript
// Email already exists
if (error.code === 'P2002') {
  throw new ApiError(400, 'Email already in use')
}
```

**P2025: Record not found**
```typescript
// Record doesn't exist
if (error.code === 'P2025') {
  throw new ApiError(404, 'User not found')
}
```

**P2014: Required relation violation**
```typescript
// Foreign key doesn't exist
if (error.code === 'P2014') {
  throw new ApiError(400, 'Invalid user reference')
}
```

### Prisma Studio

Open visual database browser:

```bash
npx prisma studio
```

Opens at `http://localhost:5555`

### Reset Database

```bash
# ⚠️ WARNING: This deletes all data
npx prisma migrate reset
```

### View Generated Client

```bash
# See generated TypeScript types
cat node_modules/.prisma/client/index.d.ts
```

---

## 📚 Useful Resources

- [Prisma Documentation](https://www.prisma.io/docs/)
- [Prisma Schema Reference](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference)
- [Prisma Client API](https://www.prisma.io/docs/reference/api-reference/prisma-client-reference)
- [Database Best Practices](https://www.prisma.io/docs/guides/performance-and-optimization/query-optimization-performance)

---

## ✅ Quick Reference

### Setup
```bash
npm install @prisma/client prisma
npx prisma init
npx prisma migrate dev --name init
```

### Common Commands
```bash
npx prisma generate    # Generate Prisma Client
npx prisma migrate dev # Create and apply migration
npx prisma studio     # Open visual database browser
npx prisma reset      # Reset database (⚠️ deletes data)
```

### Basic Query Pattern
```typescript
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

// Use prisma
const user = await prisma.user.findUnique({
  where: { id: 1 },
  include: { patients: true },
})

// Disconnect
await prisma.$disconnect()
```

---

**Last Updated**: 2024
**Status**: Production Ready
