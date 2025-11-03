# ============================================
# RENDER DEPLOYMENT CONFIGURATION
# Auto-deploys all 11 microservices
# ============================================

services:
  # ============================================
  # API GATEWAY
  # ============================================
  - type: web
    name: studyspot-api-gateway
    env: node
    region: singapore
    plan: free
    buildCommand: npm install && npm run build
    startCommand: node dist/services/api-gateway/index.js
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 3000
      - key: DATABASE_URL
        fromDatabase:
          name: studyspot-db
          property: connectionString
      - key: REDIS_HOST
        fromService:
          name: studyspot-redis
          type: redis
          property: host
      - key: JWT_SECRET
        generateValue: true
      - key: JWT_REFRESH_SECRET
        generateValue: true
    healthCheckPath: /health

  # ============================================
  # AUTH SERVICE
  # ============================================
  - type: web
    name: studyspot-auth-service
    env: node
    region: singapore
    plan: free
    buildCommand: npm install && npm run build
    startCommand: node dist/services/auth-service/index.js
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 3001
      - key: DATABASE_URL
        fromDatabase:
          name: studyspot-db
          property: connectionString
      - key: REDIS_HOST
        fromService:
          name: studyspot-redis
          type: redis
          property: host
      - key: JWT_SECRET
        sync: false
      - key: JWT_REFRESH_SECRET
        sync: false
    healthCheckPath: /health

  # ============================================
  # TENANT SERVICE
  # ============================================
  - type: web
    name: studyspot-tenant-service
    env: node
    region: singapore
    plan: free
    buildCommand: npm install && npm run build
    startCommand: node dist/services/tenant-service/index.js
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 3003
      - key: DATABASE_URL
        fromDatabase:
          name: studyspot-db
          property: connectionString
    healthCheckPath: /health

  # ============================================
  # PAYMENT SERVICE
  # ============================================
  - type: web
    name: studyspot-payment-service
    env: node
    region: singapore
    plan: free
    buildCommand: npm install && npm run build
    startCommand: node dist/services/payment-service/index.js
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 3006
      - key: DATABASE_URL
        fromDatabase:
          name: studyspot-db
          property: connectionString
      - key: CASHFREE_APP_ID
        sync: false
      - key: CASHFREE_SECRET_KEY
        sync: false
      - key: RAZORPAY_KEY_ID
        sync: false
      - key: RAZORPAY_KEY_SECRET
        sync: false
    healthCheckPath: /health

  # ============================================
  # MESSAGING SERVICE
  # ============================================
  - type: web
    name: studyspot-messaging-service
    env: node
    region: singapore
    plan: free
    buildCommand: npm install && npm run build
    startCommand: node dist/services/messaging-service/index.js
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 3011
      - key: DATABASE_URL
        fromDatabase:
          name: studyspot-db
          property: connectionString
      - key: REDIS_HOST
        fromService:
          name: studyspot-redis
          type: redis
          property: host
      - key: MSG91_AUTH_KEY
        sync: false
      - key: MSG91_SENDER_ID
        value: STDYSP
      - key: BSNL_ENTITY_ID
        sync: false
    healthCheckPath: /health

  # Add other services similarly...

# ============================================
# DATABASES
# ============================================
databases:
  - name: studyspot-db
    databaseName: studyspot_core
    user: studyspot
    plan: free
    region: singapore

  - name: studyspot-redis
    plan: free
    region: singapore
    maxmemoryPolicy: allkeys-lru

