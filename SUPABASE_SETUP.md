# �️ Supabase Database Setup Guide

Complete guide to use Supabase as your PostgreSQL database for HMIS project.

## 📋 Table of Contents

1. [What is Supabase?](#what-is-supabase)
2. [Getting Started](#getting-started)
3. [Database Setup](#database-setup)
4. [Schema Design](#schema-design)
5. [Backend Integration](#backend-integration)
6. [Database Operations](#database-operations)
7. [Migration & Backup](#migration--backup)
8. [Performance & Optimization](#performance--optimization)
9. [Troubleshooting](#troubleshooting)

---

## 🤔 What is Supabase?

**Supabase** provides a managed PostgreSQL database with:

- 🗄️ **PostgreSQL Database** - Fully featured, managed, cloud-hosted
- 📊 **SQL Editor** - Browser-based SQL IDE
- 🔍 **Data Browser** - Visual table management
- 📈 **Monitoring** - Performance metrics and logs
- 🔐 **Row Level Security** - Database-level access control
- 💾 **Backups** - Automatic daily backups
- 📁 **Extensions** - PostgreSQL extensions (PostGIS, UUID, etc.)

**Cost**: Free tier includes 500MB database (perfect for development/testing).

---

## 🎯 Getting Started

### Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up (GitHub, Google, or email)
3. Click **"New Project"**
4. Fill in project details:
   - **Name**: `hmis`
   - **Database Password**: Strong password (save it!)
   - **Region**: Closest to your users
5. Click **"Create new project"** (takes 2-3 minutes)

### Step 2: Get Database Credentials

Once the project is created:

1. Go to **Settings** → **Database**
2. Copy these values:
   - **Host** (e.g., `db.xyz.supabase.co`)
   - **Port** (usually `5432`)
   - **Database Name** (usually `postgres`)
   - **Database User** (usually `postgres`)
   - **Database Password** (what you created)
   - **Connection String** (full URL)

3. Save to your `.env` file

### Step 3: Update Environment Variables

#### Server (.env)

```env
# Database (Supabase)
DATABASE_URL=postgresql://postgres:PASSWORD@db.xyz.supabase.co:5432/postgres

# Direct connection (alternative)
SUPABASE_DB_HOST=db.xyz.supabase.co
SUPABASE_DB_PORT=5432
SUPABASE_DB_NAME=postgres
SUPABASE_DB_USER=postgres
SUPABASE_DB_PASSWORD=your_password
```

---

## 🗄️ Database Setup

### Option 1: Use Prisma Migrations (Recommended)

#### 1. Update Prisma

Update `server/prisma/.env`:

```env
DATABASE_URL="postgresql://postgres:PASSWORD@db.xyz.supabase.co:5432/postgres"
```

#### 2. Create Initial Migration

```bash
cd server
npm run prisma:migrate -- --name init
```

This creates your database schema in Supabase.

#### 3. Generate Prisma Client

```bash
npm run prisma:generate
```

### Option 2: Manual SQL Setup

Use Supabase **SQL Editor** to run queries directly.

1. Go to Supabase Dashboard
2. Click **SQL Editor**
3. Click **New Query**
4. Paste and run the SQL from [Schema Design section](#schema-design)

---

## 📊 Schema Design

### Basic HMIS Schema

Create tables using **SQL Editor** in Supabase Dashboard:

```sql
-- Users table
CREATE TABLE users (
  id BIGSERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('user', 'admin', 'doctor', 'nurse')),
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP
);

-- Patients table
CREATE TABLE patients (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date_of_birth DATE NOT NULL,
  gender VARCHAR(20),
  phone VARCHAR(20),
  address TEXT,
  medical_history TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP,
  UNIQUE(user_id)
);

-- Appointments table
CREATE TABLE appointments (
  id BIGSERIAL PRIMARY KEY,
  patient_id BIGINT NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id BIGINT NOT NULL REFERENCES users(id) ON DELETE SET NULL,
  appointment_date TIMESTAMP NOT NULL,
  status VARCHAR(50) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Medical Records table
CREATE TABLE medical_records (
  id BIGSERIAL PRIMARY KEY,
  patient_id BIGINT NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id BIGINT NOT NULL REFERENCES users(id),
  diagnosis TEXT NOT NULL,
  treatment TEXT,
  medications TEXT,
  record_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_patients_user_id ON patients(user_id);
CREATE INDEX idx_appointments_patient_id ON appointments(patient_id);
CREATE INDEX idx_appointments_doctor_id ON appointments(doctor_id);
CREATE INDEX idx_medical_records_patient_id ON medical_records(patient_id);

-- Enable soft deletes with updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for users table
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create trigger for patients table
CREATE TRIGGER update_patients_updated_at BEFORE UPDATE ON patients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create trigger for medical_records table
CREATE TRIGGER update_medical_records_updated_at BEFORE UPDATE ON medical_records
  FOR EACH ROW EXECUTE FUNCTION update_medical_records_updated_at();
```

### Update Prisma Schema

Update `server/prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        Int     @id @default(autoincrement())
  email     String  @unique
  name      String
  password  String
  role      Role    @default(USER)
  
  patients Patient[]
  appointments Appointment[] @relation("doctor")
  medicalRecords MedicalRecord[]
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  deletedAt DateTime?

  @@map("users")
}

model Patient {
  id          Int     @id @default(autoincrement())
  userId      Int     @unique
  user        User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  dateOfBirth DateTime
  gender      String?
  phone       String?
  address     String?
  medicalHistory String?
  
  appointments Appointment[]
  medicalRecords MedicalRecord[]
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  deletedAt DateTime?

  @@map("patients")
}

model Appointment {
  id              Int     @id @default(autoincrement())
  patientId       Int
  patient         Patient @relation(fields: [patientId], references: [id], onDelete: Cascade)
  
  doctorId        Int?
  doctor          User?   @relation("doctor", fields: [doctorId], references: [id], onDelete: SetNull)
  
  appointmentDate DateTime
  status          AppointmentStatus @default(SCHEDULED)
  notes           String?
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("appointments")
}

model MedicalRecord {
  id          Int     @id @default(autoincrement())
  patientId   Int
  patient     Patient @relation(fields: [patientId], references: [id], onDelete: Cascade)
  
  doctorId    Int
  doctor      User    @relation(fields: [doctorId], references: [id])
  
  diagnosis   String
  treatment   String?
  medications String?
  recordDate  DateTime @default(now())
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("medical_records")
}

enum Role {
  USER
  ADMIN
  DOCTOR
  NURSE
}

enum AppointmentStatus {
  SCHEDULED
  COMPLETED
  CANCELLED
}
```

---

## 🔧 Backend Integration

### Install Dependencies

```bash
cd server
npm install @prisma/client
npm install --save-dev prisma
```

### Create Database Service

Create `server/src/services/database.service.ts`:

```typescript
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Handle connection errors
prisma.$connect()
  .catch((error) => {
    console.error('Database connection failed:', error)
    process.exit(1)
  })

// Handle process termination
process.on('SIGINT', async () => {
  await prisma.$disconnect()
  process.exit(0)
})

export default prisma
```

### Use in Controllers

Example `server/src/controllers/user.controller.ts`:

```typescript
import { Request, Response } from 'express'
import prisma from '../services/database.service'
import { ApiError } from '../middleware/errorHandler'

export const userController = {
  async getAllUsers(req: Request, res: Response) {
    try {
      const users = await prisma.user.findMany({
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
        },
      })
      res.json({ success: true, data: users })
    } catch (error) {
      throw new ApiError(500, 'Failed to fetch users')
    }
  },

  async getUserById(req: Request, res: Response) {
    try {
      const { id } = req.params
      const user = await prisma.user.findUnique({
        where: { id: parseInt(id) },
      })
      if (!user) throw new ApiError(404, 'User not found')
      res.json({ success: true, data: user })
    } catch (error) {
      if (error instanceof ApiError) throw error
      throw new ApiError(500, 'Failed to fetch user')
    }
  },

  async createUser(req: Request, res: Response) {
    try {
      const { email, name, password, role } = req.body
      const user = await prisma.user.create({
        data: { email, name, password, role },
      })
      res.json({ success: true, data: user })
    } catch (error) {
      if ((error as any).code === 'P2002') {
        throw new ApiError(400, 'Email already exists')
      }
      throw new ApiError(500, 'Failed to create user')
    }
  },

  async updateUser(req: Request, res: Response) {
    try {
      const { id } = req.params
      const user = await prisma.user.update({
        where: { id: parseInt(id) },
        data: req.body,
      })
      res.json({ success: true, data: user })
    } catch (error) {
      throw new ApiError(500, 'Failed to update user')
    }
  },

  async deleteUser(req: Request, res: Response) {
    try {
      const { id } = req.params
      await prisma.user.delete({
        where: { id: parseInt(id) },
      })
      res.json({ success: true, data: { message: 'User deleted' } })
    } catch (error) {
      throw new ApiError(500, 'Failed to delete user')
    }
  },
}
```

---

## 📦 Database Operations

### Basic CRUD Operations

```typescript
import prisma from '../services/database.service'

// CREATE
const user = await prisma.user.create({
  data: {
    email: 'john@example.com',
    name: 'John Doe',
    password: 'hashed_password',
    role: 'USER',
  },
})

// READ - Single
const user = await prisma.user.findUnique({
  where: { email: 'john@example.com' },
})

// READ - Many
const users = await prisma.user.findMany({
  where: { role: 'DOCTOR' },
  orderBy: { createdAt: 'desc' },
  take: 10, // limit
  skip: 0,  // offset
})

// UPDATE
const user = await prisma.user.update({
  where: { id: 1 },
  data: { name: 'Jane Doe' },
})

// DELETE
await prisma.user.delete({
  where: { id: 1 },
})

// Soft Delete (using deletedAt)
const user = await prisma.user.update({
  where: { id: 1 },
  data: { deletedAt: new Date() },
})

// Query with relations
const patient = await prisma.patient.findUnique({
  where: { id: 1 },
  include: {
    user: true,
    appointments: true,
    medicalRecords: true,
  },
})

// Aggregations
const count = await prisma.user.count({
  where: { role: 'DOCTOR' },
})

const stats = await prisma.appointment.aggregate({
  _count: true,
  _max: { appointmentDate: true },
  _min: { appointmentDate: true },
})
```

### Complex Queries

```typescript
// Group by
const appointmentsByStatus = await prisma.appointment.groupBy({
  by: ['status'],
  _count: true,
})

// Raw SQL (when needed)
const result = await prisma.$queryRaw`
  SELECT u.name, COUNT(a.id) as appointment_count
  FROM users u
  LEFT JOIN appointments a ON u.id = a.doctor_id
  WHERE u.role = 'DOCTOR'
  GROUP BY u.id
`

// Transactions
const result = await prisma.$transaction(async (tx) => {
  const user = await tx.user.create({ data: { /* ... */ } })
  const patient = await tx.patient.create({ 
    data: { userId: user.id, /* ... */ } 
  })
  return { user, patient }
})
```

---

## 💾 Migration & Backup

### Generate Migrations

```bash
# Create a migration for changes
npm run prisma:migrate -- --name add_new_fields

# Review changes
npm run prisma:migrate -- --name add_new_fields --dry-run

# Apply migrations to database
npm run prisma:migrate
```

### Database Backups

#### Automatic Backups
Supabase automatically creates daily backups. Access them:
1. Go to **Settings** → **Backups**
2. Download or restore from any backup

#### Manual Backup

Using pg_dump:

```bash
pg_dump -h db.xyz.supabase.co \
  -U postgres \
  -d postgres \
  -F c \
  -f backup.dump
```

#### Restore Backup

```bash
pg_restore -h db.xyz.supabase.co \
  -U postgres \
  -d postgres \
  backup.dump
```

---

## 📈 Performance & Optimization

### Add Indexes

```sql
-- For frequently queried columns
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_patients_user_id ON patients(user_id);

-- For date ranges
CREATE INDEX idx_appointments_date ON appointments(appointment_date);

-- Composite index for common queries
CREATE INDEX idx_appointments_patient_doctor ON appointments(patient_id, doctor_id);
```

### Query Optimization

```typescript
// ❌ Bad - N+1 queries
const patients = await prisma.patient.findMany()
for (const patient of patients) {
  const records = await prisma.medicalRecord.findMany({
    where: { patientId: patient.id },
  })
}

// ✅ Good - Single query with relations
const patients = await prisma.patient.findMany({
  include: { medicalRecords: true },
})

// ✅ Good - Select only needed fields
const users = await prisma.user.findMany({
  select: { id: true, name: true, email: true },
})

// ✅ Good - Limit results
const users = await prisma.user.findMany({
  take: 20,
  skip: (page - 1) * 20,
})
```

### Monitor Performance

In Supabase Dashboard:
1. Go to **Monitoring** → **Queries**
2. View slowest queries
3. Check **Resource Usage**

---

## 🐛 Troubleshooting

### Connection Issues

**Problem**: `Can't connect to database`

**Solution**:
```typescript
// Test connection
await prisma.$connect()
console.log('Connected to database')
```

Check:
- DATABASE_URL is correct
- IP is whitelisted in Supabase
- Password is correct

### Migration Errors

**Problem**: `Migration fails`

**Solution**:
```bash
# Check migration status
npx prisma migrate status

# Reset database (WARNING: deletes all data)
npm run prisma:reset

# Resolve issues
npx prisma migrate resolve --rolled-back migration_name
```

### Performance Issues

**Problem**: `Slow queries`

**Solution**:
1. Add indexes to frequently queried columns
2. Use `select` to fetch only needed fields
3. Avoid N+1 queries with `include`
4. Use pagination for large results

### Row Level Security Issues

**Problem**: `Access denied`

**Solution**:
Supabase RLS is disabled by default for database-only setup.
Enable only if needed (requires auth setup).

---

## 📚 Useful Resources

- [Prisma Documentation](https://www.prisma.io/docs/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Supabase Database Guide](https://supabase.com/docs/guides/database)
- [Connection Pooling](https://supabase.com/docs/guides/database/connecting-to-postgres)

---

## ✅ Checklist

- [ ] Create Supabase project
- [ ] Copy database credentials to `.env`
- [ ] Install Prisma and dependencies
- [ ] Create/update Prisma schema
- [ ] Run migrations
- [ ] Generate Prisma client
- [ ] Create database service
- [ ] Create controllers with CRUD operations
- [ ] Test database connections
- [ ] Add indexes for performance
- [ ] Set up backup strategy
- [ ] Monitor database performance

---

**Last Updated**: 2024
**Status**: Production Ready

---

## 🗄️ Database Operations

### Create Tables in Supabase

Go to **SQL Editor** in Supabase Dashboard and run:

```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'user',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Posts table (example)
CREATE TABLE posts (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  content TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Enable RLS (Row Level Security)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own posts" ON posts
  FOR SELECT USING (auth.uid() = user_id);
```

### Query Data (Frontend)

```typescript
// Read
const { data, error } = await supabase
  .from('posts')
  .select('*')
  .eq('user_id', userId)

// Create
const { data, error } = await supabase
  .from('posts')
  .insert([{ user_id: userId, title: 'New Post', content: 'Content...' }])

// Update
const { data, error } = await supabase
  .from('posts')
  .update({ title: 'Updated Title' })
  .eq('id', postId)

// Delete
const { error } = await supabase
  .from('posts')
  .delete()
  .eq('id', postId)
```

### Query Data (Backend)

```typescript
// Using admin client (bypasses RLS)
const { data, error } = await supabaseAdmin
  .from('users')
  .select('*')

// Using anon client (respects RLS)
const { data, error } = await supabaseClient
  .from('posts')
  .select('*')
  .eq('user_id', userId)
```

---

## 🐛 Troubleshooting

### Connection Issues

**Problem**: `Can't connect to database`

**Solution**:
```typescript
// Test connection
await prisma.$connect()
console.log('Connected to database')
```

Check:
- DATABASE_URL is correct
- IP is whitelisted in Supabase
- Password is correct

### Migration Errors

**Problem**: `Migration fails`

**Solution**:
```bash
# Check migration status
npx prisma migrate status

# Reset database (WARNING: deletes all data)
npm run prisma:reset

# Resolve issues
npx prisma migrate resolve --rolled-back migration_name
```

### Performance Issues

**Problem**: `Slow queries`

**Solution**:
1. Add indexes to frequently queried columns
2. Use `select` to fetch only needed fields
3. Avoid N+1 queries with `include`
4. Use pagination for large results

### Row Level Security Issues

**Problem**: `Access denied`

**Solution**:
Supabase RLS is disabled by default for database-only setup.
Enable only if needed (requires auth setup).

---

## 📚 Useful Resources

- [Prisma Documentation](https://www.prisma.io/docs/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Supabase Database Guide](https://supabase.com/docs/guides/database)
- [Connection Pooling](https://supabase.com/docs/guides/database/connecting-to-postgres)

---

## ✅ Checklist

- [ ] Create Supabase project
- [ ] Copy database credentials to `.env`
- [ ] Install Prisma and dependencies
- [ ] Create/update Prisma schema
- [ ] Run migrations
- [ ] Generate Prisma client
- [ ] Create database service
- [ ] Create controllers with CRUD operations
- [ ] Test database connections
- [ ] Add indexes for performance
- [ ] Set up backup strategy
- [ ] Monitor database performance

---

**Last Updated**: 2024
**Status**: Production Ready Database Setup
