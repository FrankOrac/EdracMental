# Deployment Guide

Complete guide for deploying the Edrac CBT platform to production environments.

## 🚀 Deployment Overview

The Edrac platform is designed to deploy easily on various hosting platforms with minimal configuration. The recommended deployment platform is **Replit Deployments** for its simplicity and integration.

## 📋 Pre-Deployment Checklist

### Environment Variables

Ensure all required environment variables are configured:

```env
# Database (Required)
DATABASE_URL=postgresql://username:password@host:port/database

# Session Security (Required)
SESSION_SECRET=your-secure-random-string-here

# AI Features (Optional)
OPENAI_API_KEY=sk-your-openai-api-key

# Payment Processing (Optional)
PAYSTACK_SECRET_KEY=sk_live_your-paystack-secret
STRIPE_SECRET_KEY=sk_live_your-stripe-secret

# Email Services (Optional)
SENDGRID_API_KEY=SG.your-sendgrid-api-key

# OAuth (Optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### Database Preparation

```bash
# 1. Ensure database schema is up to date
npm run db:push

# 2. Create default users and seed data
npx tsx scripts/create-default-users.ts
npx tsx scripts/seed.ts

# 3. Verify database connectivity
npx tsx -e "import { db } from './server/db'; console.log('Database connected successfully');"
```

### Security Configuration

```typescript
// Update production settings in server/index.ts
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: 'strict' // CSRF protection
  }
}));

// Add security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  next();
});
```

## 🔧 Replit Deployment

### Step 1: Prepare for Deployment

```bash
# 1. Ensure all code is committed
git add .
git commit -m "Prepare for production deployment"
git push origin main

# 2. Build the application
npm run build

# 3. Test production build locally
npm start
```

### Step 2: Configure Replit Deployment

1. **Click the Deploy button** in your Replit project
2. **Configure environment variables** in the deployment settings:
   - Add all required environment variables
   - Ensure DATABASE_URL points to your production database
   - Use secure, randomly generated SESSION_SECRET

3. **Set deployment settings**:
   - **Build command**: `npm run build`
   - **Start command**: `npm start`
   - **Root directory**: `/`

### Step 3: Database Setup

```bash
# If using a new production database:
# 1. Create the database
# 2. Set the DATABASE_URL environment variable
# 3. Push schema to production database
npm run db:push

# 4. Seed production data
npx tsx scripts/create-default-users.ts
```

### Step 4: Deploy and Verify

1. **Deploy the application** through Replit interface
2. **Wait for deployment** to complete
3. **Test the deployed application**:
   - Verify the landing page loads
   - Test login functionality
   - Check database connectivity
   - Test core features

## 🌐 Alternative Deployment Platforms

### Vercel Deployment

```json
// vercel.json
{
  "version": 2,
  "builds": [
    {
      "src": "server/index.ts",
      "use": "@vercel/node"
    },
    {
      "src": "client/dist/**",
      "use": "@vercel/static"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/server/index.ts"
    },
    {
      "src": "/(.*)",
      "dest": "/client/dist/$1"
    }
  ],
  "env": {
    "DATABASE_URL": "@database-url",
    "SESSION_SECRET": "@session-secret",
    "OPENAI_API_KEY": "@openai-api-key"
  }
}
```

### Railway Deployment

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY . .

# Build application
RUN npm run build

# Expose port
EXPOSE 5000

# Start application
CMD ["npm", "start"]
```

```yaml
# railway.toml
[build]
  builder = "dockerfile"

[deploy]
  startCommand = "npm start"
  restartPolicyType = "on-failure"
  restartPolicyMaxRetries = 10

[env]
  NODE_ENV = "production"
```

### Heroku Deployment

```json
// package.json additions
{
  "scripts": {
    "heroku-postbuild": "npm run build",
    "start": "node dist/index.js"
  },
  "engines": {
    "node": "18.x",
    "npm": "9.x"
  }
}
```

```txt
// Procfile
web: npm start
```

## 🗄 Database Deployment

### PostgreSQL Production Setup

```sql
-- Create production database user
CREATE USER edrac_prod WITH PASSWORD 'secure_password';

-- Create production database
CREATE DATABASE edrac_production OWNER edrac_prod;

-- Grant necessary permissions
GRANT ALL PRIVILEGES ON DATABASE edrac_production TO edrac_prod;
GRANT ALL ON SCHEMA public TO edrac_prod;
```

### Database Migration Strategy

```bash
# Backup existing data before schema changes
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql

# Apply schema changes
npm run db:push

# Verify schema applied correctly
npm run db:check
```

### Connection Pooling

```typescript
// For high-traffic production environments
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection could not be established
});

export const db = drizzle(pool);
```

## 🔐 Production Security

### HTTPS Configuration

```typescript
// Force HTTPS in production
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.header('x-forwarded-proto') !== 'https') {
      res.redirect(`https://${req.header('host')}${req.url}`);
    } else {
      next();
    }
  });
}
```

### Rate Limiting

```typescript
import rateLimit from 'express-rate-limit';

// General rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

// Stricter rate limiting for authentication
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 auth requests per windowMs
  skipSuccessfulRequests: true
});

app.use('/api/', limiter);
app.use('/api/auth/', authLimiter);
```

### Input Validation & Sanitization

```typescript
import helmet from 'helmet';
import { body, validationResult } from 'express-validator';

// Security middleware
app.use(helmet());

// Input validation example
app.post('/api/questions',
  requireAuth,
  [
    body('text').escape().trim().isLength({ min: 1, max: 1000 }),
    body('options').isArray({ min: 2, max: 6 }),
    body('correctAnswer').escape().trim().isLength({ min: 1, max: 50 }),
    body('difficulty').isIn(['easy', 'medium', 'hard'])
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    // Process validated data
  }
);
```

## 📊 Monitoring & Logging

### Application Logging

```typescript
import winston from 'winston';

// Production logging configuration
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'edrac-api' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
});

// Add console logging in development
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

// Use logger throughout application
app.use((req, res, next) => {
  logger.info('Request received', {
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });
  next();
});
```

### Health Check Endpoints

```typescript
// Health check for monitoring systems
app.get('/health', async (req, res) => {
  try {
    // Check database connectivity
    await db.select().from(users).limit(1);
    
    // Check external services
    const checks = {
      database: 'healthy',
      server: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage()
    };
    
    res.status(200).json(checks);
  } catch (error) {
    res.status(503).json({
      database: 'unhealthy',
      server: 'degraded',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Readiness check
app.get('/ready', async (req, res) => {
  try {
    // Perform more thorough checks
    await db.select().from(subjects).limit(1);
    res.status(200).json({ status: 'ready' });
  } catch (error) {
    res.status(503).json({ status: 'not ready', error: error.message });
  }
});
```

## 🔄 CI/CD Pipeline

### GitHub Actions Example

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test
      - run: npm run build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Replit
        run: |
          # Deploy to Replit using their API or CLI
          echo "Deploying to production..."
```

## 📈 Performance Optimization

### Production Build Optimization

```typescript
// vite.config.ts for production
export default defineConfig({
  build: {
    minify: 'esbuild',
    target: 'es2020',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-select']
        }
      }
    }
  },
  esbuild: {
    drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : []
  }
});
```

### CDN Configuration

```typescript
// Serve static assets from CDN in production
if (process.env.NODE_ENV === 'production') {
  app.use('/assets', express.static('dist/public', {
    maxAge: '1y', // Cache static assets for 1 year
    etag: false
  }));
}
```

## 🔧 Maintenance & Updates

### Database Backups

```bash
# Automated backup script
#!/bin/bash
# backup.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="backup_${DATE}.sql"

# Create backup
pg_dump $DATABASE_URL > $BACKUP_FILE

# Upload to cloud storage (example with AWS S3)
aws s3 cp $BACKUP_FILE s3://your-backup-bucket/database-backups/

# Keep only last 30 days of backups locally
find . -name "backup_*.sql" -mtime +30 -delete

echo "Backup completed: $BACKUP_FILE"
```

### Application Updates

```bash
# Zero-downtime deployment strategy
# 1. Deploy to staging environment first
# 2. Run automated tests
# 3. Deploy to production during low-traffic period
# 4. Monitor application health
# 5. Rollback if issues detected

# Update deployment script
#!/bin/bash
echo "Starting deployment..."

# Build new version
npm run build

# Run database migrations if needed
npm run db:migrate

# Restart application (platform-specific)
echo "Deployment completed successfully"
```

This deployment guide ensures your Edrac CBT platform can be successfully deployed to production with proper security, monitoring, and maintenance procedures in place.