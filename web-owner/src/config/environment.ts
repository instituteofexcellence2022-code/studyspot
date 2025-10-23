/**
 * Environment Configuration
 * Validates and exports all environment variables with proper error handling
 */

// Validation helper
const getEnvVar = (key: string, defaultValue?: string, required: boolean = false): string => {
  const value = process.env[key] || defaultValue;
  
  if (required && !value) {
    console.error(`❌ CRITICAL: Required environment variable ${key} is not set!`);
    console.error(`Please check your .env file.`);
    throw new Error(`Missing required environment variable: ${key}`);
  }
  
  if (!value && !defaultValue) {
    console.warn(`⚠️ Warning: Environment variable ${key} is not set, using empty string`);
    return '';
  }
  
  return value || '';
};

// Environment Configuration
export const ENV = {
  // Environment
  NODE_ENV: getEnvVar('NODE_ENV', 'development') as 'development' | 'production' | 'test',
  
  // API Configuration
  API_URL: getEnvVar('REACT_APP_API_URL', 'http://localhost:3001', true),
  API_TIMEOUT: parseInt(getEnvVar('REACT_APP_API_TIMEOUT', '30000')),
  
  // Portal Configuration
  PORTAL_TYPE: getEnvVar('REACT_APP_PORTAL_TYPE', 'owner') as 'owner' | 'admin',
  PORTAL_NAME: getEnvVar('REACT_APP_PORTAL_NAME', 'Library Owner Portal'),
  VERSION: getEnvVar('REACT_APP_VERSION', '1.0.0'),
  
  // Feature Flags
  ENABLE_DEMO_ACCOUNT: getEnvVar('REACT_APP_ENABLE_DEMO', 'true') === 'true',
  ENABLE_SOCIAL_LOGIN: getEnvVar('REACT_APP_ENABLE_SOCIAL_LOGIN', 'false') === 'true',
  
  // Debug
  DEBUG: getEnvVar('REACT_APP_DEBUG', 'false') === 'true',
} as const;

// Validate configuration on load
const validateConfig = () => {
  const errors: string[] = [];
  
  // Validate API URL format
  try {
    new URL(ENV.API_URL);
  } catch (e) {
    errors.push(`Invalid API_URL format: ${ENV.API_URL}`);
  }
  
  // Validate API timeout
  if (isNaN(ENV.API_TIMEOUT) || ENV.API_TIMEOUT < 1000) {
    errors.push(`Invalid API_TIMEOUT: ${ENV.API_TIMEOUT} (must be >= 1000ms)`);
  }
  
  // Validate portal type
  if (!['owner', 'admin'].includes(ENV.PORTAL_TYPE)) {
    errors.push(`Invalid PORTAL_TYPE: ${ENV.PORTAL_TYPE} (must be 'owner' or 'admin')`);
  }
  
  if (errors.length > 0) {
    console.error('❌ Environment Configuration Errors:');
    errors.forEach(err => console.error(`  - ${err}`));
    throw new Error('Invalid environment configuration');
  }
  
  // Log configuration in development
  if (ENV.NODE_ENV === 'development') {
    console.log('✅ Environment Configuration Loaded:');
    console.log(`  - API URL: ${ENV.API_URL}`);
    console.log(`  - Portal: ${ENV.PORTAL_TYPE} (${ENV.PORTAL_NAME})`);
    console.log(`  - Environment: ${ENV.NODE_ENV}`);
    console.log(`  - Version: ${ENV.VERSION}`);
  }
};

// Run validation
try {
  validateConfig();
} catch (error) {
  console.error('Fatal: Failed to load environment configuration', error);
}

export default ENV;


