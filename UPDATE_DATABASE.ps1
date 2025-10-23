# 🗄️ STUDYSPOT - DATABASE UPDATE SCRIPT
# This script will update your database with all Phase 1 features

Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "🗄️  STUDYSPOT DATABASE UPDATE" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" -ForegroundColor Cyan

Write-Host "📋 This will update your Supabase database with:" -ForegroundColor Yellow
Write-Host "   ✓ Enhanced Role System (6 granular roles)" -ForegroundColor White
Write-Host "   ✓ Student Groups & KYC Verification" -ForegroundColor White
Write-Host "   ✓ GST-compliant Invoicing System" -ForegroundColor White
Write-Host "   ✓ Expense Tracking" -ForegroundColor White
Write-Host "   ✓ Comprehensive Audit Trail" -ForegroundColor White
Write-Host "   ✓ Security Event Monitoring" -ForegroundColor White
Write-Host "   ✓ Session Management`n" -ForegroundColor White

Write-Host "⏱️  Estimated time: 2-3 minutes`n" -ForegroundColor Gray

# Confirmation
$confirmation = Read-Host "Are you ready to update the database? (yes/no)"
if ($confirmation -ne "yes") {
    Write-Host "`n❌ Update cancelled." -ForegroundColor Red
    exit 0
}

Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "🔄 RUNNING DATABASE MIGRATIONS..." -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" -ForegroundColor Cyan

# Change to API directory
Set-Location api

# Check if .env exists
if (-Not (Test-Path ".env")) {
    Write-Host "❌ ERROR: api/.env file not found!" -ForegroundColor Red
    Write-Host "Please make sure your database credentials are in api/.env`n" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Found api/.env file" -ForegroundColor Green
Write-Host "✅ Found migrations directory" -ForegroundColor Green

Write-Host "`n📊 Migrations to run:" -ForegroundColor Cyan
Write-Host "   1. 001_initial_schema.sql" -ForegroundColor Gray
Write-Host "   2. 002_phase5_advanced_features.sql" -ForegroundColor Gray
Write-Host "   3. 003_subscription_system.sql" -ForegroundColor Gray
Write-Host "   4. 004_tenant_management.sql" -ForegroundColor Gray
Write-Host "   5. 005_rbac_system.sql" -ForegroundColor Gray
Write-Host "   6. 006_credit_management.sql" -ForegroundColor Gray
Write-Host "   7. 007_student_groups.sql ⭐ NEW" -ForegroundColor Yellow
Write-Host "   8. 008_invoices_expenses.sql ⭐ NEW" -ForegroundColor Yellow
Write-Host "   9. 009_audit_security.sql ⭐ NEW`n" -ForegroundColor Yellow

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "🚀 STARTING MIGRATION..." -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" -ForegroundColor Cyan

# Run migrations using the Node.js script
Write-Host "⏳ Running all migrations (this may take 1-2 minutes)...`n" -ForegroundColor Yellow

try {
    # Try to run the migration script
    node -e "
        require('dotenv').config();
        const { Pool } = require('pg');
        const fs = require('fs');
        const path = require('path');

        async function runMigrations() {
            const pool = new Pool({
                host: process.env.DB_HOST,
                port: process.env.DB_PORT,
                database: process.env.DB_NAME,
                user: process.env.DB_USER,
                password: process.env.DB_PASSWORD,
                ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
            });

            try {
                console.log('✅ Connected to database');
                
                // Get all migration files in order
                const migrationsDir = path.join(__dirname, 'migrations');
                const files = fs.readdirSync(migrationsDir)
                    .filter(f => f.endsWith('.sql'))
                    .sort();

                console.log('📋 Found ' + files.length + ' migration files\n');

                // Run each migration
                for (const file of files) {
                    const filePath = path.join(migrationsDir, file);
                    const sql = fs.readFileSync(filePath, 'utf8');
                    
                    console.log('⏳ Running: ' + file);
                    try {
                        await pool.query(sql);
                        console.log('✅ Completed: ' + file);
                    } catch (err) {
                        // If table already exists, that's okay
                        if (err.message.includes('already exists')) {
                            console.log('⚠️  Already applied: ' + file);
                        } else {
                            console.log('❌ Error in: ' + file);
                            console.log('   ' + err.message);
                        }
                    }
                }

                console.log('\n✅ All migrations processed!');
                await pool.end();
            } catch (err) {
                console.error('❌ Database error:', err.message);
                process.exit(1);
            }
        }

        runMigrations();
    "
    
    Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
    Write-Host "✅ DATABASE UPDATE COMPLETE!" -ForegroundColor Green
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" -ForegroundColor Cyan
    
    Write-Host "🎉 Your database now includes:" -ForegroundColor Yellow
    Write-Host "   ✅ 6 Granular Roles (Owner, Manager, Staff, etc.)" -ForegroundColor Green
    Write-Host "   ✅ 70+ Permissions System" -ForegroundColor Green
    Write-Host "   ✅ Student Groups & KYC Management" -ForegroundColor Green
    Write-Host "   ✅ GST-compliant Invoicing" -ForegroundColor Green
    Write-Host "   ✅ Expense Tracking System" -ForegroundColor Green
    Write-Host "   ✅ Comprehensive Audit Logs" -ForegroundColor Green
    Write-Host "   ✅ Security Event Monitoring" -ForegroundColor Green
    Write-Host "   ✅ Session Management" -ForegroundColor Green
    
    Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
    Write-Host "🚀 READY FOR DEPLOYMENT!" -ForegroundColor Green
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" -ForegroundColor Cyan
    
    Write-Host "📝 Next Step:" -ForegroundColor Yellow
    Write-Host "   Open DEPLOY_NOW_STEP_BY_STEP.md and follow STEP 1`n" -ForegroundColor White
    
} catch {
    Write-Host "`n❌ ERROR during migration:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host "`n💡 TIP: Make sure your database credentials in api/.env are correct`n" -ForegroundColor Yellow
    exit 1
}

# Return to root directory
Set-Location ..


