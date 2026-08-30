# HMIS Server

Healthcare Management Information System - Express Backend

## 🚀 Tech Stack

- **Express 5** - Web framework
- **TypeScript** - Type safety
- **Prisma** - ORM
- **PostgreSQL** - Database
- **JWT** - Authentication
- **Zod** - Schema validation
- **Helmet** - Security headers
- **CORS** - Cross-origin requests

## 📦 Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 12+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Setup Prisma
npm run prisma:generate
npm run prisma:migrate
```

### Development

```bash
# Start development server (with auto-reload)
npm run dev

# Server runs on http://localhost:3000
```

### Build & Deploy

```bash
# Build
npm run build

# Start production server
npm start
```

### Database

```bash
# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Open Prisma Studio (GUI)
npm run prisma:studio

# Reset database (⚠️ destructive)
npm run prisma:reset
```

### Testing

```bash
# Run tests
npm test
```

## 📁 Project Structure

```
src/
├── index.ts              # Entry point
├── middleware/           # Express middleware
├── routes/              # API routes
├── controllers/         # Route handlers
├── services/            # Business logic
├── schemas/             # Zod schemas
├── types/               # TypeScript types
└── utils/               # Utility functions

prisma/
├── schema.prisma        # Database schema
└── migrations/          # Migration files
```

## 🔐 Environment Variables

See `.env.example` for available configuration options.

## 🛡️ Security Features

- Helmet for HTTP headers
- CORS validation
- Rate limiting
- JWT authentication
- Password hashing (bcryptjs)
- Input validation with Zod

## 📚 API Documentation

API endpoints will be documented here.

## 🤝 Contributing

Please follow TypeScript and ESLint conventions.
