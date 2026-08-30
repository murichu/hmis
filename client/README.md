# HMIS Client

Healthcare Management Information System - React Frontend

## 🚀 Tech Stack

- **React 19** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **React Router** - Routing
- **Zustand** - State management
- **React Hook Form** - Form handling
- **Zod** - Schema validation
- **TanStack Query** - Data fetching

## 📦 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Create environment file
cp .env.example .env.local
```

### Development

```bash
# Start development server
npm run dev

# Open http://localhost:5173
```

### Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

### Linting

```bash
# Run ESLint
npm run lint
```

## 📁 Project Structure

```
src/
├── api/              # API client and services
├── components/       # Reusable components
├── pages/           # Page components
├── hooks/           # Custom hooks
├── stores/          # Zustand stores
├── types/           # TypeScript types
├── utils/           # Utility functions
├── App.tsx          # Main app component
└── main.tsx         # Entry point
```

## 🔐 Environment Variables

See `.env.example` for available configuration options.

## 🧪 Testing (TODO)

- Add Vitest + React Testing Library setup
- Add E2E tests with Playwright

## 📚 Documentation

More documentation coming soon...
