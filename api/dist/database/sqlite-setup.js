const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// Create database directory if it doesn't exist
const dbDir = path.join(__dirname, '../../data');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, {
    recursive: true
  });
}

// Create database connection
const dbPath = path.join(dbDir, 'studyspot.db');
const db = new Database(dbPath, {
  verbose: console.log
});
console.log('📊 SQLite Database Path:', dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Create all tables
const createTables = () => {
  console.log('Creating tables...');

  // Users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      phone TEXT,
      role TEXT NOT NULL DEFAULT 'student',
      status TEXT NOT NULL DEFAULT 'active',
      tenant_id TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Libraries table
  db.exec(`
    CREATE TABLE IF NOT EXISTS libraries (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      address TEXT NOT NULL,
      city TEXT NOT NULL,
      state TEXT NOT NULL,
      pincode TEXT NOT NULL,
      phone TEXT,
      email TEXT,
      latitude REAL,
      longitude REAL,
      total_seats INTEGER DEFAULT 0,
      available_seats INTEGER DEFAULT 0,
      opening_time TEXT,
      closing_time TEXT,
      amenities TEXT,
      images TEXT,
      rating REAL DEFAULT 0,
      status TEXT DEFAULT 'active',
      owner_id TEXT,
      tenant_id TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (owner_id) REFERENCES users(id)
    );
  `);

  // Bookings table
  db.exec(`
    CREATE TABLE IF NOT EXISTS bookings (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      library_id TEXT NOT NULL,
      seat_number TEXT,
      booking_date DATE NOT NULL,
      start_time TIME NOT NULL,
      end_time TIME NOT NULL,
      duration INTEGER NOT NULL,
      amount REAL NOT NULL,
      status TEXT DEFAULT 'pending',
      payment_status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (library_id) REFERENCES libraries(id)
    );
  `);

  // Payments table
  db.exec(`
    CREATE TABLE IF NOT EXISTS payments (
      id TEXT PRIMARY KEY,
      booking_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      amount REAL NOT NULL,
      payment_method TEXT NOT NULL,
      transaction_id TEXT,
      status TEXT DEFAULT 'pending',
      payment_date DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (booking_id) REFERENCES bookings(id),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `);

  // Subscription plans table
  db.exec(`
    CREATE TABLE IF NOT EXISTS subscription_plans (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      display_name TEXT NOT NULL,
      description TEXT,
      price_monthly REAL NOT NULL DEFAULT 0,
      price_yearly REAL NOT NULL DEFAULT 0,
      features TEXT,
      limits TEXT,
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Subscriptions table
  db.exec(`
    CREATE TABLE IF NOT EXISTS subscriptions (
      id TEXT PRIMARY KEY,
      tenant_id TEXT NOT NULL,
      plan_id TEXT NOT NULL,
      billing_cycle TEXT NOT NULL,
      status TEXT DEFAULT 'active',
      current_period_start DATETIME NOT NULL,
      current_period_end DATETIME NOT NULL,
      cancel_at_period_end INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (plan_id) REFERENCES subscription_plans(id)
    );
  `);

  // Tenants table
  db.exec(`
    CREATE TABLE IF NOT EXISTS tenants (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      phone TEXT,
      address TEXT,
      city TEXT,
      state TEXT,
      country TEXT DEFAULT 'India',
      status TEXT DEFAULT 'active',
      subscription_id TEXT,
      settings TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (subscription_id) REFERENCES subscriptions(id)
    );
  `);

  // Roles table
  db.exec(`
    CREATE TABLE IF NOT EXISTS roles (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      display_name TEXT NOT NULL,
      description TEXT,
      is_system INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Permissions table
  db.exec(`
    CREATE TABLE IF NOT EXISTS permissions (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      display_name TEXT NOT NULL,
      description TEXT,
      resource TEXT NOT NULL,
      action TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Role permissions junction table
  db.exec(`
    CREATE TABLE IF NOT EXISTS role_permissions (
      role_id TEXT NOT NULL,
      permission_id TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (role_id, permission_id),
      FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
      FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
    );
  `);

  // User roles junction table
  db.exec(`
    CREATE TABLE IF NOT EXISTS user_roles (
      user_id TEXT NOT NULL,
      role_id TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (user_id, role_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
    );
  `);

  // Credit packages table
  db.exec(`
    CREATE TABLE IF NOT EXISTS credit_packages (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      credit_amount INTEGER NOT NULL,
      price REAL NOT NULL,
      bonus_credits INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Credit balances table
  db.exec(`
    CREATE TABLE IF NOT EXISTS credit_balances (
      id TEXT PRIMARY KEY,
      tenant_id TEXT NOT NULL UNIQUE,
      balance INTEGER NOT NULL DEFAULT 0,
      last_topup DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Credit transactions table
  db.exec(`
    CREATE TABLE IF NOT EXISTS credit_transactions (
      id TEXT PRIMARY KEY,
      tenant_id TEXT NOT NULL,
      type TEXT NOT NULL,
      amount INTEGER NOT NULL,
      balance_before INTEGER NOT NULL,
      balance_after INTEGER NOT NULL,
      purpose TEXT,
      reference TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
  console.log('✅ All tables created successfully!');
};

// Seed initial data
const seedData = () => {
  console.log('Seeding initial data...');

  // Check if data already exists
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get();
  if (userCount.count > 0) {
    console.log('✅ Data already exists, skipping seed');
    return;
  }

  // Insert admin user
  const insertUser = db.prepare(`
    INSERT INTO users (id, email, password, first_name, last_name, phone, role, status, tenant_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insertUser.run('00000000-0000-0000-0000-000000000001', 'admin@studyspot.com', '$2b$10$rKjHvLNnN8K5yFZ4YQ5YLOqYxKZQwx7xKvKJXZQwx7xKvKJXZQwx7',
  // hashed: Admin@123
  'Admin', 'User', '+919876543210', 'super_admin', 'active', '00000000-0000-0000-0000-000000000000');

  // Insert subscription plans
  const insertPlan = db.prepare(`
    INSERT INTO subscription_plans (id, name, display_name, description, price_monthly, price_yearly, features, limits)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const plans = [{
    id: 'plan-free',
    name: 'free',
    display_name: 'Free',
    description: 'Perfect for getting started',
    price_monthly: 0,
    price_yearly: 0,
    features: JSON.stringify(['Basic features', '1 library', '100 bookings/month']),
    limits: JSON.stringify({
      max_libraries: 1,
      max_bookings_per_month: 100
    })
  }, {
    id: 'plan-starter',
    name: 'starter',
    display_name: 'Starter',
    description: 'Great for small businesses',
    price_monthly: 999,
    price_yearly: 9999,
    features: JSON.stringify(['All basic features', '5 libraries', '500 bookings/month', 'Analytics']),
    limits: JSON.stringify({
      max_libraries: 5,
      max_bookings_per_month: 500
    })
  }, {
    id: 'plan-pro',
    name: 'pro',
    display_name: 'Professional',
    description: 'For growing businesses',
    price_monthly: 2999,
    price_yearly: 29999,
    features: JSON.stringify(['All starter features', 'Unlimited libraries', 'Unlimited bookings', 'AI features']),
    limits: JSON.stringify({
      max_libraries: -1,
      max_bookings_per_month: -1
    })
  }];
  plans.forEach(plan => {
    insertPlan.run(plan.id, plan.name, plan.display_name, plan.description, plan.price_monthly, plan.price_yearly, plan.features, plan.limits);
  });

  // Insert default tenant
  const insertTenant = db.prepare(`
    INSERT INTO tenants (id, name, email, status)
    VALUES (?, ?, ?, ?)
  `);
  insertTenant.run('00000000-0000-0000-0000-000000000000', 'System', 'system@studyspot.com', 'active');
  console.log('✅ Initial data seeded successfully!');
};

// Run setup
try {
  createTables();
  seedData();
  console.log('🎉 Database setup complete!');
  console.log('📊 Database location:', dbPath);
  process.exit(0);
} catch (error) {
  console.error('❌ Database setup failed:', error);
  process.exit(1);
}
module.exports = db;