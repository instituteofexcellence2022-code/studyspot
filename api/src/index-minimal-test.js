// Minimal test to find the problematic route
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

console.log('Testing routes one by one...\n');

try {
  console.log('1. Loading auth routes...');
  const authRoutes = require('./routes/auth');
  app.use('/api/auth', authRoutes);
  console.log('✅ auth routes OK\n');

  console.log('2. Loading users routes...');
  const userRoutes = require('./routes/users');
  app.use('/api/users', userRoutes);
  console.log('✅ users routes OK\n');

  console.log('3. Loading libraries routes...');
  const libraryRoutes = require('./routes/libraries');
  app.use('/api/libraries', libraryRoutes);
  console.log('✅ libraries routes OK\n');

  console.log('4. Loading bookings routes...');
  const bookingRoutes = require('./routes/bookings');
  app.use('/api/bookings', bookingRoutes);
  console.log('✅ bookings routes OK\n');

  console.log('5. Loading payments routes...');
  const paymentRoutes = require('./routes/payments');
  app.use('/api/payments', paymentRoutes);
  console.log('✅ payments routes OK\n');

  console.log('6. Loading dashboard routes...');
  const dashboardRoutes = require('./routes/dashboard');
  app.use('/api/dashboard', dashboardRoutes);
  console.log('✅ dashboard routes OK\n');

  console.log('7. Loading students routes...');
  const studentRoutes = require('./routes/students');
  app.use('/api/students', studentRoutes);
  console.log('✅ students routes OK\n');

  console.log('8. Loading tenants routes...');
  const tenantRoutes = require('./routes/tenants');
  app.use('/api/tenants', tenantRoutes);
  console.log('✅ tenants routes OK\n');

  console.log('9. Loading subscriptions routes...');
  const subscriptionRoutes = require('./routes/subscriptions');
  app.use('/api/subscriptions', subscriptionRoutes);
  console.log('✅ subscriptions routes OK\n');

  console.log('10. Loading credits routes...');
  const creditRoutes = require('./routes/credits');
  app.use('/api/credits', creditRoutes);
  console.log('✅ credits routes OK\n');

  console.log('11. Loading roles routes...');
  const roleRoutes = require('./routes/roles');
  app.use('/api/roles', roleRoutes);
  console.log('✅ roles routes OK\n');

  console.log('12. Loading invoices routes...');
  const invoiceRoutes = require('./routes/invoices');
  app.use('/api/invoices', invoiceRoutes);
  console.log('✅ invoices routes OK\n');

  console.log('13. Loading audit routes...');
  const auditRoutes = require('./routes/audit');
  app.use('/api/audit', auditRoutes);
  console.log('✅ audit routes OK\n');

  console.log('\n🎉 ALL ROUTES LOADED SUCCESSFULLY!\n');
  console.log('The error must be in one of the other routes or middlewares.');

} catch (error) {
  console.error('\n❌ ERROR FOUND:', error.message);
  console.error('\nStack trace:');
  console.error(error.stack);
}

