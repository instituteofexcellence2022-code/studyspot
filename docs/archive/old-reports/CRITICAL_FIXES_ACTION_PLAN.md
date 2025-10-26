# 🚨 Critical Fixes - Action Plan

**Based on Quality Audit Report**  
**Priority: CRITICAL - Must complete before production**

---

## 1. Implement Comprehensive Testing (4-6 weeks) 🧪

**Current Coverage**: 15-20%  
**Target Coverage**: 80%+  
**Priority**: 🔴 CRITICAL

### Week 1-2: Backend Unit Tests

#### Step 1: Setup Test Infrastructure

```bash
# Install testing dependencies
cd api
npm install --save-dev jest supertest @types/jest @types/supertest
```

**Create** `api/jest.config.js`:
```javascript
module.exports = {
  testEnvironment: 'node',
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/**/*.test.js',
    '!src/**/index.js'
  ],
  testMatch: [
    '**/tests/**/*.test.js'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
};
```

#### Step 2: Create Test Database Setup

**Create** `api/tests/setup.js`:
```javascript
const { Pool } = require('pg');

let testPool;

beforeAll(async () => {
  // Create test database connection
  testPool = new Pool({
    connectionString: process.env.TEST_DATABASE_URL || 'postgresql://studyspot:studyspot123@localhost:5432/studyspot_test'
  });

  // Run migrations
  await runMigrations(testPool);
});

afterAll(async () => {
  // Clean up
  await testPool.end();
});

beforeEach(async () => {
  // Clear all tables
  await testPool.query('TRUNCATE users, libraries, bookings, payments CASCADE');
});

module.exports = { testPool };
```

#### Step 3: Write Unit Tests for Services

**Create** `api/tests/unit/services/authService.test.js`:
```javascript
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query } = require('../../../src/config/database');

describe('AuthService - Registration', () => {
  it('should hash password with bcrypt', async () => {
    const password = 'Password123';
    const hashedPassword = await bcrypt.hash(password, 12);
    
    expect(hashedPassword).not.toBe(password);
    expect(hashedPassword.length).toBeGreaterThan(50);
    
    const isMatch = await bcrypt.compare(password, hashedPassword);
    expect(isMatch).toBe(true);
  });

  it('should generate valid JWT token', () => {
    const payload = { id: '123', email: 'test@example.com', role: 'student' };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    expect(decoded.id).toBe(payload.id);
    expect(decoded.email).toBe(payload.email);
  });

  it('should reject weak passwords', () => {
    const weakPasswords = ['123', 'password', 'abc', '12345678'];
    
    weakPasswords.forEach(password => {
      expect(password.length).toBeLessThan(8);
    });
  });
});
```

**Create more unit tests**:
- `api/tests/unit/services/userService.test.js`
- `api/tests/unit/services/libraryService.test.js`
- `api/tests/unit/services/bookingService.test.js`
- `api/tests/unit/middleware/auth.test.js`
- `api/tests/unit/utils/logger.test.js`

### Week 3-4: Backend Integration Tests

**Create** `api/tests/integration/auth.test.js`:
```javascript
const request = require('supertest');
const app = require('../../src/index-unified');
const { testPool } = require('../setup');

describe('POST /api/auth/register', () => {
  it('should register a new user successfully', async () => {
    const userData = {
      email: 'newuser@test.com',
      password: 'SecurePass123',
      firstName: 'Test',
      lastName: 'User',
      role: 'student'
    };

    const response = await request(app)
      .post('/api/auth/register')
      .send(userData)
      .expect(201);

    expect(response.body.success).toBe(true);
    expect(response.body.data.user.email).toBe(userData.email);
    expect(response.body.data.tokens).toHaveProperty('accessToken');
    expect(response.body.data.tokens).toHaveProperty('refreshToken');

    // Verify user in database
    const result = await testPool.query(
      'SELECT * FROM users WHERE email = $1',
      [userData.email]
    );
    expect(result.rows.length).toBe(1);
  });

  it('should return 409 for duplicate email', async () => {
    const userData = {
      email: 'duplicate@test.com',
      password: 'SecurePass123',
      firstName: 'Test',
      lastName: 'User',
      role: 'student'
    };

    // Register first time
    await request(app).post('/api/auth/register').send(userData).expect(201);

    // Try to register again
    const response = await request(app)
      .post('/api/auth/register')
      .send(userData)
      .expect(409);

    expect(response.body.errors[0].code).toBe('USER_EXISTS');
  });

  it('should validate email format', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'invalidemail',
        password: 'SecurePass123',
        firstName: 'Test',
        lastName: 'User',
        role: 'student'
      })
      .expect(400);

    expect(response.body.errors[0].code).toBe('VALIDATION_ERROR');
  });
});

describe('POST /api/auth/login', () => {
  beforeEach(async () => {
    // Create test user
    await request(app).post('/api/auth/register').send({
      email: 'testuser@test.com',
      password: 'TestPass123',
      firstName: 'Test',
      lastName: 'User',
      role: 'student'
    });
  });

  it('should login with correct credentials', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'testuser@test.com',
        password: 'TestPass123'
      })
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data.user.email).toBe('testuser@test.com');
    expect(response.body.data.tokens).toHaveProperty('accessToken');
  });

  it('should reject incorrect password', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'testuser@test.com',
        password: 'WrongPassword123'
      })
      .expect(401);

    expect(response.body.errors[0].code).toBe('INVALID_CREDENTIALS');
  });

  it('should reject non-existent user', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'nonexistent@test.com',
        password: 'SomePassword123'
      })
      .expect(401);

    expect(response.body.errors[0].code).toBe('INVALID_CREDENTIALS');
  });
});
```

**Create more integration tests**:
- `api/tests/integration/users.test.js`
- `api/tests/integration/libraries.test.js`
- `api/tests/integration/bookings.test.js`
- `api/tests/integration/payments.test.js`

### Week 5: Frontend Unit Tests

**Create** `web-owner/src/pages/auth/__tests__/CleanLoginPage.test.tsx`:
```typescript
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import CleanLoginPage from '../CleanLoginPage';
import authSlice from '../../../store/slices/authSlice';

const mockStore = configureStore({
  reducer: {
    auth: authSlice,
  },
});

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <Provider store={mockStore}>
      <BrowserRouter>
        {component}
      </BrowserRouter>
    </Provider>
  );
};

describe('CleanLoginPage', () => {
  it('renders login form', () => {
    renderWithProviders(<CleanLoginPage />);
    
    expect(screen.getByText(/Library Owner Portal/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sign In/i })).toBeInTheDocument();
  });

  it('shows validation error for empty form', async () => {
    renderWithProviders(<CleanLoginPage />);
    
    const submitButton = screen.getByRole('button', { name: /Sign In/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/Please enter both email and password/i)).toBeInTheDocument();
    });
  });

  it('validates email format', async () => {
    renderWithProviders(<CleanLoginPage />);
    
    const emailInput = screen.getByLabelText(/Email Address/i);
    const passwordInput = screen.getByLabelText(/Password/i);
    const submitButton = screen.getByRole('button', { name: /Sign In/i });
    
    fireEvent.change(emailInput, { target: { value: 'invalidemail' } });
    fireEvent.change(passwordInput, { target: { value: 'Password123' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(emailInput).toBeInvalid();
    });
  });

  it('handles demo account click', async () => {
    renderWithProviders(<CleanLoginPage />);
    
    const demoButton = screen.getByRole('button', { name: /Try Demo Account/i });
    fireEvent.click(demoButton);
    
    await waitFor(() => {
      expect(demoButton).toBeDisabled();
    });
  });
});
```

**Create more frontend tests**:
- `web-owner/src/services/__tests__/api.test.ts`
- `web-owner/src/store/slices/__tests__/authSlice.test.ts`
- `web-owner/src/components/common/__tests__/ProtectedRoute.test.tsx`

### Week 6: E2E Tests with Playwright

**Install Playwright**:
```bash
npm install --save-dev @playwright/test
npx playwright install
```

**Create** `e2e/auth.spec.ts`:
```typescript
import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('should complete full registration and login flow', async ({ page }) => {
    // Navigate to registration page
    await page.goto('http://localhost:3000/register');
    
    // Fill registration form
    await page.fill('input[name="firstName"]', 'Test');
    await page.fill('input[name="lastName"]', 'User');
    await page.fill('input[name="email"]', `test${Date.now()}@example.com`);
    await page.fill('input[name="phone"]', '+1234567890');
    await page.fill('input[name="password"]', 'SecurePass123');
    await page.selectOption('select[name="role"]', 'library_owner');
    
    // Submit registration
    await page.click('button[type="submit"]');
    
    // Should redirect to dashboard
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.locator('h1')).toContainText('Dashboard');
  });

  test('should login with demo account', async ({ page }) => {
    await page.goto('http://localhost:3000/login');
    
    // Click demo button
    await page.click('button:has-text("Try Demo Account")');
    
    // Wait for success message
    await expect(page.locator('text=Login successful')).toBeVisible({ timeout: 10000 });
    
    // Should redirect to dashboard
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });
  });

  test('should handle login errors gracefully', async ({ page }) => {
    await page.goto('http://localhost:3000/login');
    
    await page.fill('input[type="email"]', 'wrong@example.com');
    await page.fill('input[type="password"]', 'WrongPassword');
    await page.click('button[type="submit"]');
    
    // Should show error message
    await expect(page.locator('text=Invalid credentials')).toBeVisible();
  });
});
```

---

## 2. Create CI/CD Pipeline (1 week) 🔄

**Priority**: 🔴 CRITICAL

### Step 1: Create GitHub Actions Workflow

**Create** `.github/workflows/ci.yml`:
```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

env:
  NODE_VERSION: '18'

jobs:
  # Backend Tests
  api-test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15-alpine
        env:
          POSTGRES_DB: studyspot_test
          POSTGRES_USER: studyspot
          POSTGRES_PASSWORD: studyspot123
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
      
      redis:
        image: redis:7-alpine
        ports:
          - 6379:6379
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
          cache-dependency-path: api/package-lock.json
      
      - name: Install dependencies
        working-directory: ./api
        run: npm ci
      
      - name: Run linter
        working-directory: ./api
        run: npm run lint
      
      - name: Run tests
        working-directory: ./api
        run: npm test
        env:
          NODE_ENV: test
          TEST_DATABASE_URL: postgresql://studyspot:studyspot123@localhost:5432/studyspot_test
          REDIS_URL: redis://localhost:6379
          JWT_SECRET: test-jwt-secret
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./api/coverage/lcov.info
          flags: api

  # Frontend Tests - Owner Portal
  web-owner-test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
          cache-dependency-path: web-owner/package-lock.json
      
      - name: Install dependencies
        working-directory: ./web-owner
        run: npm ci
      
      - name: Run linter
        working-directory: ./web-owner
        run: npm run lint || true
      
      - name: Run tests
        working-directory: ./web-owner
        run: npm test -- --coverage --watchAll=false
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./web-owner/coverage/lcov.info
          flags: web-owner

  # Frontend Tests - Admin Portal
  web-admin-test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
          cache-dependency-path: web-admin/package-lock.json
      
      - name: Install dependencies
        working-directory: ./web-admin
        run: npm ci
      
      - name: Run tests
        working-directory: ./web-admin
        run: npm test -- --coverage --watchAll=false
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./web-admin/coverage/lcov.info
          flags: web-admin

  # E2E Tests
  e2e-test:
    runs-on: ubuntu-latest
    needs: [api-test, web-owner-test]
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: ${{ env.NODE_VERSION }}
      
      - name: Install Playwright
        run: npx playwright install --with-deps
      
      - name: Start services
        run: docker-compose up -d
      
      - name: Wait for services
        run: |
          sleep 30
          curl --retry 10 --retry-delay 5 http://localhost:3001/health
      
      - name: Run E2E tests
        run: npx playwright test
      
      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/

  # Build Docker Images
  build:
    runs-on: ubuntu-latest
    needs: [api-test, web-owner-test, web-admin-test]
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v2
      
      - name: Login to DockerHub
        if: github.event_name != 'pull_request'
        uses: docker/login-action@v2
        with:
          username: ${{ secrets.DOCKERHUB_USERNAME }}
          password: ${{ secrets.DOCKERHUB_TOKEN }}
      
      - name: Build and push API
        uses: docker/build-push-action@v4
        with:
          context: ./api
          push: ${{ github.event_name != 'pull_request' }}
          tags: studyspot/api:${{ github.sha }},studyspot/api:latest
          cache-from: type=gha
          cache-to: type=gha,mode=max
      
      - name: Build and push Web Owner
        uses: docker/build-push-action@v4
        with:
          context: ./web-owner
          push: ${{ github.event_name != 'pull_request' }}
          tags: studyspot/web-owner:${{ github.sha }},studyspot/web-owner:latest
          cache-from: type=gha
          cache-to: type=gha,mode=max
      
      - name: Build and push Web Admin
        uses: docker/build-push-action@v4
        with:
          context: ./web-admin
          push: ${{ github.event_name != 'pull_request' }}
          tags: studyspot/web-admin:${{ github.sha }},studyspot/web-admin:latest
          cache-from: type=gha
          cache-to: type=gha,mode=max

  # Deploy to Staging
  deploy-staging:
    runs-on: ubuntu-latest
    needs: [build, e2e-test]
    if: github.ref == 'refs/heads/develop'
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to staging
        run: |
          # Add deployment script here
          echo "Deploying to staging environment"

  # Deploy to Production
  deploy-production:
    runs-on: ubuntu-latest
    needs: [build, e2e-test]
    if: github.ref == 'refs/heads/main'
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to production
        run: |
          # Add deployment script here
          echo "Deploying to production environment"
```

---

## 3. Create Missing Dockerfiles (1 day) 🐳

**Priority**: 🔴 CRITICAL

### API Dockerfile

**Create** `api/Dockerfile`:
```dockerfile
# Multi-stage build for production

# Stage 1: Dependencies
FROM node:18-alpine AS dependencies
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# Stage 2: Build
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build || echo "No build step"

# Stage 3: Production
FROM node:18-alpine AS production
WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Copy dependencies and application
COPY --from=dependencies --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=build --chown=nodejs:nodejs /app/src ./src
COPY --from=build --chown=nodejs:nodejs /app/package*.json ./

# Switch to non-root user
USER nodejs

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:${PORT:-3001}/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Expose port
EXPOSE 3001

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start application
CMD ["node", "src/index-unified.js"]
```

### Web Owner Dockerfile

**Create** `web-owner/Dockerfile`:
```dockerfile
# Multi-stage build for React app

# Stage 1: Build
FROM node:18-alpine AS build
WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Build app
ENV REACT_APP_API_URL=http://localhost:3001
RUN npm run build

# Stage 2: Production with Nginx
FROM nginx:alpine AS production

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built files
COPY --from=build /app/build /usr/share/nginx/html

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:80/ || exit 1

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
```

**Create** `web-owner/nginx.conf`:
```nginx
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/javascript application/xml+rss application/json;

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

### Web Admin Dockerfile (Same as Owner)

**Create** `web-admin/Dockerfile` (same as above, just copy)
**Create** `web-admin/nginx.conf` (same as above, just copy)

---

## 4. Setup Infrastructure (2-3 weeks) ☁️

**Priority**: 🔴 CRITICAL

### Kubernetes Manifests

**Create** `k8s/namespace.yaml`:
```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: studyspot-prod
```

**Create** `k8s/configmap.yaml`:
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: studyspot-config
  namespace: studyspot-prod
data:
  NODE_ENV: "production"
  LOG_LEVEL: "info"
  PORT: "3001"
```

**Create** `k8s/secrets.yaml` (template - DO NOT commit real values):
```yaml
apiVersion: v1
kind: Secret
metadata:
  name: studyspot-secrets
  namespace: studyspot-prod
type: Opaque
stringData:
  DATABASE_URL: "postgresql://user:password@host:5432/studyspot"
  REDIS_URL: "redis://host:6379"
  JWT_SECRET: "your-secret-key"
  JWT_REFRESH_SECRET: "your-refresh-secret"
```

**Create** `k8s/api-deployment.yaml`:
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api
  namespace: studyspot-prod
spec:
  replicas: 3
  selector:
    matchLabels:
      app: api
  template:
    metadata:
      labels:
        app: api
    spec:
      containers:
      - name: api
        image: studyspot/api:latest
        ports:
        - containerPort: 3001
        env:
        - name: NODE_ENV
          valueFrom:
            configMapKeyRef:
              name: studyspot-config
              key: NODE_ENV
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: studyspot-secrets
              key: DATABASE_URL
        - name: JWT_SECRET
          valueFrom:
            secretKeyRef:
              name: studyspot-secrets
              key: JWT_SECRET
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3001
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 3001
          initialDelaySeconds: 10
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: api
  namespace: studyspot-prod
spec:
  selector:
    app: api
  ports:
  - protocol: TCP
    port: 3001
    targetPort: 3001
  type: ClusterIP
```

**Create** `k8s/hpa.yaml`:
```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: api-hpa
  namespace: studyspot-prod
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: api
  minReplicas: 3
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

**Create** `k8s/ingress.yaml`:
```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: studyspot-ingress
  namespace: studyspot-prod
  annotations:
    kubernetes.io/ingress.class: "nginx"
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
spec:
  tls:
  - hosts:
    - api.studyspot.com
    - owner.studyspot.com
    - admin.studyspot.com
    secretName: studyspot-tls
  rules:
  - host: api.studyspot.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: api
            port:
              number: 3001
  - host: owner.studyspot.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: web-owner
            port:
              number: 80
  - host: admin.studyspot.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: web-admin
            port:
              number: 80
```

---

## 5. Add Environment Examples (2 hours) 📝

**Priority**: 🔴 CRITICAL

**Create** `api/.env.example`:
```env
# Server Configuration
NODE_ENV=development
PORT=3001
LOG_LEVEL=info

# Database
DATABASE_URL=postgresql://studyspot:studyspot123@localhost:5432/studyspot

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_REFRESH_SECRET=your-refresh-secret-key-change-in-production
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=http://localhost:3000,http://localhost:3002

# Frontend URLs
FRONTEND_URL=http://localhost:3000

# Email (Optional)
EMAIL_ENABLED=false
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Payment Gateways
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret
STRIPE_SECRET_KEY=sk_test_your_stripe_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Google Maps
GOOGLE_MAPS_API_KEY=your_google_maps_key

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_DIR=./uploads
```

**Create** `web-owner/.env.example`:
```env
# API Configuration
REACT_APP_API_URL=http://localhost:3001

# Environment
REACT_APP_ENV=development
REACT_APP_VERSION=1.0.0

# Portal Configuration
REACT_APP_PORTAL_TYPE=owner
REACT_APP_PORTAL_NAME=Library Owner Portal

# Debug
REACT_APP_DEBUG=true

# Analytics (Optional)
REACT_APP_GOOGLE_ANALYTICS_ID=UA-XXXXXXXXX-X

# Sentry (Optional)
REACT_APP_SENTRY_DSN=https://your-sentry-dsn
```

**Create** `web-admin/.env.example`:
```env
# API Configuration
REACT_APP_API_URL=http://localhost:3001

# Environment
REACT_APP_ENV=development
REACT_APP_VERSION=1.0.0

# Portal Configuration
REACT_APP_PORTAL_TYPE=admin
REACT_APP_PORTAL_NAME=Platform Admin Portal

# Debug
REACT_APP_DEBUG=true

# Analytics (Optional)
REACT_APP_GOOGLE_ANALYTICS_ID=UA-XXXXXXXXX-X

# Sentry (Optional)
REACT_APP_SENTRY_DSN=https://your-sentry-dsn
```

---

## Timeline Summary

| Task | Priority | Duration | Status |
|------|----------|----------|--------|
| Backend Unit Tests | 🔴 CRITICAL | 2 weeks | ⏳ Pending |
| Backend Integration Tests | 🔴 CRITICAL | 2 weeks | ⏳ Pending |
| Frontend Unit Tests | 🔴 CRITICAL | 1 week | ⏳ Pending |
| E2E Tests | 🔴 CRITICAL | 1 week | ⏳ Pending |
| CI/CD Pipeline | 🔴 CRITICAL | 1 week | ⏳ Pending |
| Dockerfiles | 🔴 CRITICAL | 1 day | ⏳ Pending |
| Kubernetes Setup | 🔴 CRITICAL | 2-3 weeks | ⏳ Pending |
| .env.example Files | 🔴 CRITICAL | 2 hours | ⏳ Pending |

**Total Estimated Time**: **8-12 weeks**

---

## Next Steps

1. ✅ Review and approve this action plan
2. ✅ Start with testing implementation (Week 1)
3. ✅ Create Dockerfiles immediately (Day 1)
4. ✅ Setup CI/CD pipeline (Week 2)
5. ✅ Begin infrastructure work (Week 3)
6. ✅ Parallel work on all fronts with proper coordination

**Remember**: Testing is the most critical item. Without proper test coverage, production deployment would be extremely risky.


