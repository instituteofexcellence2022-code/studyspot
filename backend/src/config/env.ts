// ============================================
// ENVIRONMENT CONFIGURATION
// Validates and exports environment variables
// ============================================

import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

// Environment schema
const envSchema = z.object({
  // Node Environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  
  // Database Configuration
  DATABASE_URL: z.string().optional(),
  CORE_DB_HOST: z.string().default('localhost'),
  CORE_DB_PORT: z.string().default('5432'),
  CORE_DB_NAME: z.string().default('studyspot_core'),
  CORE_DB_USER: z.string().default('postgres'),
  CORE_DB_PASSWORD: z.string().default(''),
  CORE_DB_SSL: z.string().default('false'),
  CORE_DB_POOL_MIN: z.string().default('2'),
  CORE_DB_POOL_MAX: z.string().default('20'),
  
  // Tenant Database
  USE_SHARED_DATABASE: z.string().default('true'),
  TENANT_DB_POOL_MIN: z.string().default('1'),
  TENANT_DB_POOL_MAX: z.string().default('10'),
  
  // JWT Configuration
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_ACCESS_TOKEN_EXPIRY: z.string().default('15m'),
  JWT_REFRESH_TOKEN_EXPIRY: z.string().default('7d'),
  
  // Service Ports
  API_GATEWAY_PORT: z.string().default('3000'),
  AUTH_SERVICE_PORT: z.string().default('3001'),
  USER_SERVICE_PORT: z.string().default('3002'),
  TENANT_SERVICE_PORT: z.string().default('3003'),
  STUDENT_SERVICE_PORT: z.string().default('3004'),
  LIBRARY_SERVICE_PORT: z.string().default('3005'),
  BOOKING_SERVICE_PORT: z.string().default('3006'),
  PAYMENT_SERVICE_PORT: z.string().default('3007'),
  ADMIN_SERVICE_PORT: z.string().default('3008'),
  ATTENDANCE_SERVICE_PORT: z.string().default('3009'),
  COMMUNITY_SERVICE_PORT: z.string().default('3010'),
  MESSAGING_SERVICE_PORT: z.string().default('3011'),
  MESSAGE_SERVICE_PORT: z.string().default('3012'),
  ANALYTICS_SERVICE_PORT: z.string().default('3013'),
  SUBSCRIPTION_SERVICE_PORT: z.string().default('3014'),
  CREDIT_SERVICE_PORT: z.string().default('3015'),
  SOCKET_SERVICE_PORT: z.string().default('3016'),
  NOTIFICATION_SERVICE_PORT: z.string().default('3017'),
  DOCUMENT_SERVICE_PORT: z.string().default('3018'),
  
  // CORS
  CORS_ORIGIN: z.string().optional(),
  
  // Rate Limiting
  RATE_LIMIT_MAX: z.string().default('100'),
  RATE_LIMIT_WINDOW: z.string().default('1 minute'),
  
  // Security
  ADMIN_IP_WHITELIST: z.string().optional(),
  
  // Logging
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
  
  // External Services
  RAZORPAY_KEY_ID: z.string().optional(),
  RAZORPAY_KEY_SECRET: z.string().optional(),
  CASHFREE_APP_ID: z.string().optional(),
  CASHFREE_SECRET_KEY: z.string().optional(),
});

// Parse and validate environment variables
let env: z.infer<typeof envSchema>;

try {
  env = envSchema.parse(process.env);
} catch (error) {
  if (error instanceof z.ZodError) {
    console.error('❌ Environment validation failed:');
    error.errors.forEach((err) => {
      console.error(`  - ${err.path.join('.')}: ${err.message}`);
    });
    process.exit(1);
  }
  throw error;
}

// Export validated environment variables
export const config = {
  nodeEnv: env.NODE_ENV,
  isDevelopment: env.NODE_ENV === 'development',
  isProduction: env.NODE_ENV === 'production',
  isTest: env.NODE_ENV === 'test',
  
  database: {
    url: env.DATABASE_URL,
    host: env.CORE_DB_HOST,
    port: parseInt(env.CORE_DB_PORT),
    name: env.CORE_DB_NAME,
    user: env.CORE_DB_USER,
    password: env.CORE_DB_PASSWORD,
    ssl: env.CORE_DB_SSL === 'true',
    pool: {
      min: parseInt(env.CORE_DB_POOL_MIN),
      max: parseInt(env.CORE_DB_POOL_MAX),
    },
  },
  
  tenant: {
    useSharedDatabase: env.USE_SHARED_DATABASE === 'true',
    pool: {
      min: parseInt(env.TENANT_DB_POOL_MIN),
      max: parseInt(env.TENANT_DB_POOL_MAX),
    },
  },
  
  jwt: {
    secret: env.JWT_SECRET,
    accessTokenExpiry: env.JWT_ACCESS_TOKEN_EXPIRY,
    refreshTokenExpiry: env.JWT_REFRESH_TOKEN_EXPIRY,
  },
  
  ports: {
    apiGateway: parseInt(env.API_GATEWAY_PORT),
    auth: parseInt(env.AUTH_SERVICE_PORT),
    user: parseInt(env.USER_SERVICE_PORT),
    tenant: parseInt(env.TENANT_SERVICE_PORT),
    student: parseInt(env.STUDENT_SERVICE_PORT),
    library: parseInt(env.LIBRARY_SERVICE_PORT),
    booking: parseInt(env.BOOKING_SERVICE_PORT),
    payment: parseInt(env.PAYMENT_SERVICE_PORT),
    admin: parseInt(env.ADMIN_SERVICE_PORT),
    attendance: parseInt(env.ATTENDANCE_SERVICE_PORT),
    community: parseInt(env.COMMUNITY_SERVICE_PORT),
    messaging: parseInt(env.MESSAGING_SERVICE_PORT),
    message: parseInt(env.MESSAGE_SERVICE_PORT),
    analytics: parseInt(env.ANALYTICS_SERVICE_PORT),
    subscription: parseInt(env.SUBSCRIPTION_SERVICE_PORT),
    credit: parseInt(env.CREDIT_SERVICE_PORT),
    socket: parseInt(env.SOCKET_SERVICE_PORT),
    notification: parseInt(env.NOTIFICATION_SERVICE_PORT),
    document: parseInt(env.DOCUMENT_SERVICE_PORT),
  },
  
  cors: {
    origins: env.CORS_ORIGIN?.split(',').map(o => o.trim()) || [],
  },
  
  rateLimit: {
    max: parseInt(env.RATE_LIMIT_MAX),
    window: env.RATE_LIMIT_WINDOW,
  },
  
  security: {
    adminIpWhitelist: env.ADMIN_IP_WHITELIST?.split(',').map(ip => ip.trim()) || [],
  },
  
  logging: {
    level: env.LOG_LEVEL,
  },
  
  external: {
    razorpay: {
      keyId: env.RAZORPAY_KEY_ID,
      keySecret: env.RAZORPAY_KEY_SECRET,
    },
    cashfree: {
      appId: env.CASHFREE_APP_ID,
      secretKey: env.CASHFREE_SECRET_KEY,
    },
  },
};

// Validate critical production settings
if (config.isProduction) {
  if (config.jwt.secret.length < 32) {
    console.error('❌ JWT_SECRET must be at least 32 characters in production');
    process.exit(1);
  }
  
  if (!config.database.url && !config.database.password) {
    console.error('❌ Database credentials must be set in production');
    process.exit(1);
  }
}

export default config;

