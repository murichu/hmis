# Production Environment Checklist

## 🎯 Before Deploying to Production

### Database Setup
- [ ] Create PostgreSQL database
- [ ] Run `npm run prisma:migrate` to apply schema
- [ ] Verify database connection works
- [ ] Set up database backups

### Environment Variables
- [ ] Set `NODE_ENV=production`
- [ ] Change `JWT_SECRET` to a strong random string
- [ ] Update `DATABASE_URL` to production database
- [ ] Update `CORS_ORIGIN` to production domain
- [ ] Increase `BCRYPT_ROUNDS` to 12+
- [ ] Set `LOG_LEVEL=error` for production

### Security
- [ ] Enable HTTPS/TLS
- [ ] Configure CORS to only allow production domain
- [ ] Use environment variables for all secrets
- [ ] Enable rate limiting
- [ ] Set security headers (Helmet)
- [ ] Use strong JWT expiration

### Client Setup
- [ ] Set `VITE_API_URL` to production API endpoint
- [ ] Build with `npm run build`
- [ ] Test production build locally with `npm run preview`
- [ ] Configure CDN if needed

### Testing
- [ ] Run full test suite
- [ ] Test authentication flow
- [ ] Test API endpoints
- [ ] Test error handling
- [ ] Performance testing

### Monitoring & Logging
- [ ] Set up error tracking (Sentry, etc.)
- [ ] Configure centralized logging
- [ ] Set up health check monitoring
- [ ] Configure alerts

### Deployment
- [ ] Use Docker for containerization
- [ ] Set up CI/CD pipeline
- [ ] Use process manager (PM2, systemd)
- [ ] Configure reverse proxy (Nginx, Apache)
- [ ] Test failover and recovery

### Documentation
- [ ] Document API endpoints
- [ ] Document deployment process
- [ ] Document rollback procedure
- [ ] Create runbooks for common issues

## 📋 Quick Production Deployment Steps

### Server
```bash
# 1. Install dependencies
npm install --production

# 2. Build TypeScript
npm run build

# 3. Run migrations
npm run prisma:migrate

# 4. Start server (use PM2 or systemd)
npm start
```

### Client
```bash
# 1. Install dependencies
npm install

# 2. Build for production
npm run build

# 3. Deploy dist/ folder to CDN or static server
```

## 🔍 Post-Deployment Verification

- [ ] Health check endpoint responds
- [ ] API endpoints are reachable
- [ ] Database queries work
- [ ] Authentication flows work
- [ ] Error handling is working
- [ ] Logs are being captured
- [ ] Performance is acceptable
