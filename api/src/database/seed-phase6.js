/**
 * Phase 6 Seed Data
 * Seeds: Subscription Plans, Permissions, Roles, Credit Packages
 */

const { Pool } = require('pg');
const logger = require('../utils/logger');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'studyspot',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

async function seedPhase6() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    logger.info('🌱 Starting Phase 6 seed data...');

    // ============================================
    // 1. SEED SUBSCRIPTION PLANS
    // ============================================
    
    logger.info('   → Seeding subscription plans...');
    
    const plans = [
      {
        name: 'starter',
        display_name: 'Starter Plan',
        description: 'Perfect for small libraries getting started',
        price_monthly: 49.00,
        price_yearly: 490.00,
        features: JSON.stringify({
          max_libraries: 1,
          max_users: 50,
          max_bookings_per_month: 500,
          ai_recommendations: true,
          analytics: 'basic',
          support: 'email'
        }),
        limits: JSON.stringify({
          max_libraries: 1,
          max_users: 50,
          max_bookings_per_month: 500
        })
      },
      {
        name: 'professional',
        display_name: 'Professional Plan',
        description: 'For growing library chains',
        price_monthly: 149.00,
        price_yearly: 1490.00,
        features: JSON.stringify({
          max_libraries: 5,
          max_users: 250,
          max_bookings_per_month: 5000,
          ai_recommendations: true,
          advanced_analytics: true,
          gamification: true,
          support: 'priority_email',
          whatsapp_integration: true
        }),
        limits: JSON.stringify({
          max_libraries: 5,
          max_users: 250,
          max_bookings_per_month: 5000
        })
      },
      {
        name: 'enterprise',
        display_name: 'Enterprise Plan',
        description: 'For large organizations with unlimited needs',
        price_monthly: 499.00,
        price_yearly: 4990.00,
        features: JSON.stringify({
          max_libraries: -1, // unlimited
          max_users: -1, // unlimited
          max_bookings_per_month: -1, // unlimited
          ai_recommendations: true,
          advanced_analytics: true,
          gamification: true,
          predictive_analytics: true,
          iot_integration: true,
          support: 'dedicated_account_manager',
          whatsapp_integration: true,
          sms_integration: true,
          custom_branding: true,
          sso: true,
          api_access: true
        }),
        limits: JSON.stringify({
          max_libraries: -1,
          max_users: -1,
          max_bookings_per_month: -1
        })
      }
    ];

    for (const plan of plans) {
      await client.query(
        `INSERT INTO subscription_plans (name, display_name, description, price_monthly, price_yearly, features, limits)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (name) DO NOTHING`,
        [plan.name, plan.display_name, plan.description, plan.price_monthly, plan.price_yearly, plan.features, plan.limits]
      );
    }
    
    logger.info('   ✅ Subscription plans seeded');

    // ============================================
    // 2. SEED PERMISSIONS
    // ============================================
    
    logger.info('   → Seeding permissions...');
    
    const permissions = [
      // Library permissions
      { name: 'libraries.create', display_name: 'Create Libraries', resource: 'libraries', action: 'create', description: 'Create new library locations' },
      { name: 'libraries.read', display_name: 'View Libraries', resource: 'libraries', action: 'read', description: 'View library details' },
      { name: 'libraries.update', display_name: 'Update Libraries', resource: 'libraries', action: 'update', description: 'Edit library information' },
      { name: 'libraries.delete', display_name: 'Delete Libraries', resource: 'libraries', action: 'delete', description: 'Remove libraries' },
      { name: 'libraries.manage', display_name: 'Manage Libraries', resource: 'libraries', action: 'manage', description: 'Full library management access' },
      
      // Booking permissions
      { name: 'bookings.create', display_name: 'Create Bookings', resource: 'bookings', action: 'create', description: 'Create new bookings' },
      { name: 'bookings.read', display_name: 'View Bookings', resource: 'bookings', action: 'read', description: 'View booking details' },
      { name: 'bookings.update', display_name: 'Update Bookings', resource: 'bookings', action: 'update', description: 'Modify bookings' },
      { name: 'bookings.delete', display_name: 'Cancel Bookings', resource: 'bookings', action: 'delete', description: 'Cancel bookings' },
      { name: 'bookings.manage', display_name: 'Manage All Bookings', resource: 'bookings', action: 'manage', description: 'Manage all bookings in the system' },
      
      // User permissions
      { name: 'users.create', display_name: 'Create Users', resource: 'users', action: 'create', description: 'Add new users' },
      { name: 'users.read', display_name: 'View Users', resource: 'users', action: 'read', description: 'View user profiles' },
      { name: 'users.update', display_name: 'Update Users', resource: 'users', action: 'update', description: 'Edit user information' },
      { name: 'users.delete', display_name: 'Delete Users', resource: 'users', action: 'delete', description: 'Remove users' },
      { name: 'users.manage', display_name: 'Manage Users', resource: 'users', action: 'manage', description: 'Full user management access' },
      
      // Settings permissions
      { name: 'settings.read', display_name: 'View Settings', resource: 'settings', action: 'read', description: 'View system settings' },
      { name: 'settings.update', display_name: 'Update Settings', resource: 'settings', action: 'update', description: 'Modify system settings' },
      { name: 'settings.manage', display_name: 'Manage Settings', resource: 'settings', action: 'manage', description: 'Full settings access' },
      
      // Analytics permissions
      { name: 'analytics.read', display_name: 'View Analytics', resource: 'analytics', action: 'read', description: 'View analytics and reports' },
      { name: 'analytics.export', display_name: 'Export Analytics', resource: 'analytics', action: 'export', description: 'Export analytics data' },
      
      // Financial permissions
      { name: 'finance.read', display_name: 'View Financial Data', resource: 'finance', action: 'read', description: 'View financial reports' },
      { name: 'finance.manage', display_name: 'Manage Finances', resource: 'finance', action: 'manage', description: 'Full financial access' },
      
      // Role permissions
      { name: 'roles.create', display_name: 'Create Roles', resource: 'roles', action: 'create', description: 'Create new roles' },
      { name: 'roles.read', display_name: 'View Roles', resource: 'roles', action: 'read', description: 'View role details' },
      { name: 'roles.update', display_name: 'Update Roles', resource: 'roles', action: 'update', description: 'Modify roles' },
      { name: 'roles.delete', display_name: 'Delete Roles', resource: 'roles', action: 'delete', description: 'Remove roles' },
      { name: 'roles.assign', display_name: 'Assign Roles', resource: 'roles', action: 'assign', description: 'Assign roles to users' },
      
      // Subscription permissions
      { name: 'subscriptions.read', display_name: 'View Subscriptions', resource: 'subscriptions', action: 'read', description: 'View subscription details' },
      { name: 'subscriptions.manage', display_name: 'Manage Subscriptions', resource: 'subscriptions', action: 'manage', description: 'Manage subscription plans' },
      
      // Credit permissions
      { name: 'credits.read', display_name: 'View Credits', resource: 'credits', action: 'read', description: 'View credit balance' },
      { name: 'credits.purchase', display_name: 'Purchase Credits', resource: 'credits', action: 'purchase', description: 'Buy credits' },
      { name: 'credits.manage', display_name: 'Manage Credits', resource: 'credits', action: 'manage', description: 'Full credit management' },
    ];

    for (const perm of permissions) {
      await client.query(
        `INSERT INTO permissions (name, display_name, description, resource, action)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (name) DO NOTHING`,
        [perm.name, perm.display_name, perm.description, perm.resource, perm.action]
      );
    }
    
    logger.info('   ✅ Permissions seeded');

    // ============================================
    // 3. SEED SYSTEM ROLES
    // ============================================
    
    logger.info('   → Seeding system roles...');
    
    const roles = [
      {
        name: 'super_admin',
        display_name: 'Super Administrator',
        description: 'Full system access across all tenants',
        is_system: true,
        permissions: permissions.map(p => p.name) // All permissions
      },
      {
        name: 'library_owner',
        display_name: 'Library Owner',
        description: 'Owns and manages libraries',
        is_system: true,
        permissions: [
          'libraries.manage', 'bookings.manage', 'users.manage', 
          'settings.manage', 'analytics.read', 'analytics.export',
          'finance.read', 'finance.manage', 'roles.read', 'roles.assign',
          'subscriptions.read', 'subscriptions.manage', 'credits.manage'
        ]
      },
      {
        name: 'branch_manager',
        display_name: 'Branch Manager',
        description: 'Manages a single library location',
        is_system: true,
        permissions: [
          'libraries.read', 'libraries.update', 'bookings.manage',
          'users.read', 'users.create', 'analytics.read',
          'settings.read', 'credits.read'
        ]
      },
      {
        name: 'front_desk',
        display_name: 'Front Desk Staff',
        description: 'Handles bookings and customer service',
        is_system: true,
        permissions: [
          'bookings.create', 'bookings.read', 'bookings.update',
          'users.read', 'users.create', 'libraries.read'
        ]
      },
      {
        name: 'customer',
        display_name: 'Customer',
        description: 'Regular library user',
        is_system: true,
        permissions: [
          'bookings.create', 'bookings.read', 'bookings.update', 'bookings.delete',
          'libraries.read', 'users.read'
        ]
      }
    ];

    for (const role of roles) {
      // Insert role
      const roleResult = await client.query(
        `INSERT INTO roles (name, display_name, description, is_system, tenant_id)
         VALUES ($1, $2, $3, $4, NULL)
         ON CONFLICT (tenant_id, name) WHERE tenant_id IS NULL DO UPDATE SET display_name = EXCLUDED.display_name
         RETURNING id`,
        [role.name, role.display_name, role.description, role.is_system]
      );
      
      const roleId = roleResult.rows[0].id;
      
      // Assign permissions to role
      for (const permName of role.permissions) {
        const permResult = await client.query(
          `SELECT id FROM permissions WHERE name = $1`,
          [permName]
        );
        
        if (permResult.rows.length > 0) {
          const permId = permResult.rows[0].id;
          await client.query(
            `INSERT INTO role_permissions (role_id, permission_id)
             VALUES ($1, $2)
             ON CONFLICT (role_id, permission_id) DO NOTHING`,
            [roleId, permId]
          );
        }
      }
    }
    
    logger.info('   ✅ System roles seeded');

    // ============================================
    // 4. SEED CREDIT PACKAGES
    // ============================================
    
    logger.info('   → Seeding credit packages...');
    
    const creditPackages = [
      // SMS packages
      { name: 'sms-100', display_name: '100 SMS Credits', credit_type: 'sms', credit_amount: 100, price: 10.00, bonus_credits: 0 },
      { name: 'sms-500', display_name: '500 SMS Credits', credit_type: 'sms', credit_amount: 500, price: 45.00, bonus_credits: 50 },
      { name: 'sms-1000', display_name: '1000 SMS Credits', credit_type: 'sms', credit_amount: 1000, price: 80.00, bonus_credits: 200 },
      { name: 'sms-5000', display_name: '5000 SMS Credits', credit_type: 'sms', credit_amount: 5000, price: 350.00, bonus_credits: 1500 },
      
      // WhatsApp packages
      { name: 'whatsapp-100', display_name: '100 WhatsApp Credits', credit_type: 'whatsapp', credit_amount: 100, price: 15.00, bonus_credits: 0 },
      { name: 'whatsapp-500', display_name: '500 WhatsApp Credits', credit_type: 'whatsapp', credit_amount: 500, price: 65.00, bonus_credits: 50 },
      { name: 'whatsapp-1000', display_name: '1000 WhatsApp Credits', credit_type: 'whatsapp', credit_amount: 1000, price: 120.00, bonus_credits: 200 },
      { name: 'whatsapp-5000', display_name: '5000 WhatsApp Credits', credit_type: 'whatsapp', credit_amount: 5000, price: 500.00, bonus_credits: 1500 },
      
      // Email packages (cheaper)
      { name: 'email-1000', display_name: '1000 Email Credits', credit_type: 'email', credit_amount: 1000, price: 5.00, bonus_credits: 0 },
      { name: 'email-5000', display_name: '5000 Email Credits', credit_type: 'email', credit_amount: 5000, price: 20.00, bonus_credits: 500 },
      { name: 'email-10000', display_name: '10000 Email Credits', credit_type: 'email', credit_amount: 10000, price: 35.00, bonus_credits: 2000 },
    ];

    for (const pkg of creditPackages) {
      await client.query(
        `INSERT INTO credit_packages (name, display_name, credit_type, credit_amount, price, bonus_credits, currency)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT DO NOTHING`,
        [pkg.name, pkg.display_name, pkg.credit_type, pkg.credit_amount, pkg.price, pkg.bonus_credits, 'USD']
      );
    }
    
    logger.info('   ✅ Credit packages seeded');

    await client.query('COMMIT');
    
    logger.info('');
    logger.info('✅ Phase 6 seed data completed successfully!');
    logger.info('');
    logger.info('📋 Summary:');
    logger.info('   • 3 Subscription Plans');
    logger.info('   • 35 Permissions');
    logger.info('   • 5 System Roles');
    logger.info('   • 11 Credit Packages');
    logger.info('');
    
  } catch (error) {
    await client.query('ROLLBACK');
    logger.error('❌ Error seeding Phase 6 data:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run if called directly
if (require.main === module) {
  seedPhase6()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = seedPhase6;



