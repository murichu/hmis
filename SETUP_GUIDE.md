# HMIS Project - Setup & Development Guide

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ ([download](https://nodejs.org/))
- PostgreSQL 12+ ([download](https://www.postgresql.org/download/))
- Git

### Initial Setup

```bash
# 1. Navigate to project root
cd hmis

# 2. Install dependencies for both client and server
cd client && npm install && cd ..
cd server && npm install && cd ..

# 3. Setup environment files
cp client/.env.example client/.env.local
cp server/.env.example server/.env

# 4. Configure database in server/.env
# Edit DATABASE_URL with your PostgreSQL credentials

# 5. Setup Prisma
cd server
npm run prisma:generate
npm run prisma:migrate
cd ..

# 6. Start development servers
# Terminal 1: Start backend
cd server && npm run dev

# Terminal 2: Start frontend
cd client && npm run dev
```

## 📦 Project Structure

```
hmis/
├── client/                  # React Frontend
│   ├── src/
│   │   ├── api/            # API client & services
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── stores/         # Zustand state stores
│   │   ├── types/          # TypeScript types
│   │   ├── utils/          # Utility functions
│   │   ├── App.tsx         # Main app component
│   │   └── main.tsx        # Entry point
│   ├── public/             # Static assets
│   ├── .env.example        # Environment template
│   ├── vite.config.ts      # Vite configuration
│   ├── tsconfig.json       # TypeScript config
│   └── package.json        # Dependencies
│
├── server/                  # Express Backend
│   ├── src/
│   │   ├── index.ts        # Entry point
│   │   ├── middleware/     # Express middleware
│   │   ├── routes/         # API routes
│   │   ├── controllers/    # Request handlers
│   │   ├── services/       # Business logic
│   │   ├── schemas/        # Zod validation schemas
│   │   ├── types/          # TypeScript types
│   │   └── utils/          # Utility functions
│   ├── prisma/
│   │   └── schema.prisma   # Database schema
│   ├── dist/               # Compiled JavaScript
│   ├── .env.example        # Environment template
│   ├── tsconfig.json       # TypeScript config
│   └── package.json        # Dependencies
│
└── PRODUCTION_CHECKLIST.md # Deployment guide
```

## 🔧 Available Commands

### Client

```bash
cd client

npm run dev          # Start dev server (port 5173)
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

### Server

```bash
cd server

npm run dev                # Start dev server with auto-reload (port 3000)
npm run build              # Compile TypeScript
npm start                  # Start production server
npm run test               # Run tests
npm run lint               # Run ESLint
npm run prisma:generate    # Generate Prisma client
npm run prisma:migrate     # Run database migrations
npm run prisma:studio      # Open Prisma Studio GUI
npm run prisma:reset       # Reset database (⚠️ destructive)
```

## 🗄️ Database Setup

### PostgreSQL Installation
- Windows: Use installer from postgresql.org
- macOS: `brew install postgresql`
- Linux: `sudo apt install postgresql`

### Create Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE hmis_db;

# Create user
CREATE USER hmis_user WITH PASSWORD 'secure_password';

# Grant privileges
ALTER ROLE hmis_user CREATEDB;
GRANT ALL PRIVILEGES ON DATABASE hmis_db TO hmis_user;

# Exit
\q
```

### Update .env file
```env
DATABASE_URL="postgresql://hmis_user:secure_password@localhost:5432/hmis_db"
```

### Run Migrations
```bash
cd server
npm run prisma:migrate
```

## 🔐 Environment Variables

### Client (.env.local)
```env
VITE_API_URL=http://localhost:3000/api
VITE_API_TIMEOUT=30000
VITE_ENV=development
VITE_ENABLE_DEBUG=false
```

### Server (.env)
```env
NODE_ENV=development
PORT=3000
HOST=localhost
DATABASE_URL=postgresql://user:password@localhost:5432/hmis_db
JWT_SECRET=your_development_secret_key
JWT_EXPIRY=24h
CORS_ORIGIN=http://localhost:5173
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX_REQUESTS=100
BCRYPT_ROUNDS=10
LOG_LEVEL=debug
```

## 🧪 Development Workflow

### Running Both Servers
```bash
# Terminal 1: Backend
cd server
npm run dev

# Terminal 2: Frontend
cd client
npm run dev

# Frontend: http://localhost:5173
# Backend API: http://localhost:3000/api
# Prisma Studio: npx prisma studio
```

### Making API Requests
```typescript
// In client/src/api/client.ts
import { apiClient } from '@/api/client'

// GET
const users = await apiClient.get('/users')

// POST
const newUser = await apiClient.post('/users', { name: 'John', email: 'john@example.com' })

// PUT
const updated = await apiClient.put('/users/1', { name: 'Jane' })

// DELETE
await apiClient.delete('/users/1')
```

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Kill process on port 3000 (server)
lsof -i :3000 | grep LISTEN | awk '{print $2}' | xargs kill -9

# Kill process on port 5173 (client)
lsof -i :5173 | grep LISTEN | awk '{print $2}' | xargs kill -9
```

### Database Connection Error
1. Verify PostgreSQL is running
2. Check DATABASE_URL in server/.env
3. Ensure database and user exist
4. Try resetting: `npm run prisma:reset` (will clear data)

### Node Modules Issues
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### TypeScript Errors
```bash
# Regenerate Prisma client
npm run prisma:generate

# Update TypeScript
npm install --save-dev typescript@latest
```

## 📚 Tech Stack Details

### Frontend
- **React 19**: Latest React features
- **TypeScript**: Type safety
- **Vite**: Fast build tool
- **Tailwind CSS**: Utility-first CSS
- **React Router**: Client-side routing
- **Zustand**: Lightweight state management
- **React Hook Form**: Efficient form handling
- **Zod**: TypeScript-first validation
- **TanStack Query**: Server state management

### Backend
- **Express 5**: Web framework
- **TypeScript**: Type safety
- **Prisma**: Modern ORM
- **PostgreSQL**: Relational database
- **JWT**: Authentication tokens
- **Helmet**: Security headers
- **Zod**: Runtime validation
- **nodemon**: Auto-reload in development
- **tsx**: Run TypeScript directly

## 🚀 Next Steps

1. **Create Pages**: Add pages in `client/src/pages/`
2. **Build Components**: Create reusable components in `client/src/components/`
3. **Design Database Schema**: Update `server/prisma/schema.prisma`
4. **Create API Routes**: Add routes in `server/src/routes/`
5. **Add Authentication**: Implement JWT auth middleware
6. **Add Tests**: Set up testing for both client and server
7. **Deploy**: Follow PRODUCTION_CHECKLIST.md

## 📖 Useful Resources

- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Express Guide](https://expressjs.com/en/guide/routing.html)
- [Prisma Docs](https://www.prisma.io/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Zod Documentation](https://zod.dev)
- [React Router](https://reactrouter.com/)

## ✅ Deployment Ready Checklist

See [PRODUCTION_CHECKLIST.md](./PRODUCTION_CHECKLIST.md) for complete production readiness guide.
