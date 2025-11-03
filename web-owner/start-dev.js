#!/usr/bin/env node

// Simple development server starter
const { spawn } = require('child_process');
const path = require('path');

console.log('🎓 STUDYSPOT - Starting Development Server');
console.log('========================================');

// Set environment variables
process.env.PORT = '3000';
process.env.REACT_APP_API_URL = 'http://localhost:3001';
process.env.REACT_APP_ENVIRONMENT = 'development';
process.env.GENERATE_SOURCEMAP = 'false';
process.env.DISABLE_ESLINT_PLUGIN = 'true';

console.log('Environment configured:');
console.log('- PORT: 3000');
console.log('- API URL: http://localhost:3001');
console.log('- Environment: development');
console.log('========================================');

// Start the React development server
const child = spawn('npx', ['react-scripts', 'start'], {
  stdio: 'inherit',
  shell: true,
  env: { ...process.env }
});

child.on('error', (error) => {
  console.error('Failed to start development server:', error);
  process.exit(1);
});

child.on('exit', (code) => {
  console.log(`Development server exited with code ${code}`);
  process.exit(code);
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('\nShutting down development server...');
  child.kill('SIGINT');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\nShutting down development server...');
  child.kill('SIGTERM');
  process.exit(0);
});















