#!/bin/bash

# HMIS Quick Start Script
# Run this script to set up the project for development

set -e

echo "🚀 Starting HMIS Project Setup..."
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${YELLOW}⚠️ Node.js is not installed. Please install Node.js 18+ first.${NC}"
    exit 1
fi

echo -e "${BLUE}✓ Node.js is installed: $(node --version)${NC}"
echo ""

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo -e "${YELLOW}⚠️ PostgreSQL is not installed. Please install PostgreSQL first.${NC}"
    exit 1
fi

echo -e "${BLUE}✓ PostgreSQL is installed${NC}"
echo ""

# Setup Client
echo -e "${BLUE}Setting up Frontend (Client)...${NC}"
cd client
npm install
cp .env.example .env.local
echo -e "${GREEN}✓ Frontend setup complete${NC}"
cd ..
echo ""

# Setup Server
echo -e "${BLUE}Setting up Backend (Server)...${NC}"
cd server
npm install
cp .env.example .env
echo -e "${GREEN}✓ Backend setup complete${NC}"
echo ""

# Database setup
echo -e "${YELLOW}Database Setup Required${NC}"
echo "Please ensure PostgreSQL is running and then:"
echo "1. Create a database: CREATE DATABASE hmis_db;"
echo "2. Create a user: CREATE USER hmis_user WITH PASSWORD 'your_password';"
echo "3. Grant privileges: ALTER ROLE hmis_user CREATEDB; GRANT ALL PRIVILEGES ON DATABASE hmis_db TO hmis_user;"
echo ""
echo "4. Update server/.env with your database URL"
echo "5. Run: npm run prisma:migrate"
echo ""

# Confirm and continue
read -p "Have you set up the database? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${BLUE}Running database migrations...${NC}"
    npm run prisma:migrate
    echo -e "${GREEN}✓ Migrations complete${NC}"
    cd ..
else
    cd ..
    echo -e "${YELLOW}Skipping migrations. Run 'npm run prisma:migrate' in the server directory when ready.${NC}"
fi

echo ""
echo -e "${GREEN}✅ Setup Complete!${NC}"
echo ""
echo "To start development:"
echo -e "${BLUE}Terminal 1 (Backend):${NC}"
echo "  cd server && npm run dev"
echo ""
echo -e "${BLUE}Terminal 2 (Frontend):${NC}"
echo "  cd client && npm run dev"
echo ""
echo "Then open:"
echo "  Frontend: http://localhost:5173"
echo "  Backend API: http://localhost:3000/api"
echo ""
echo "For more information, see:"
echo "  - SETUP_GUIDE.md"
echo "  - READINESS_ASSESSMENT.md"
echo "  - DEVELOPMENT_ROADMAP.md"
