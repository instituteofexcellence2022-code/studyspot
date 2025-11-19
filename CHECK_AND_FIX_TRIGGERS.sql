-- Check for triggers on admin_users table
SELECT 
    tgname AS trigger_name,
    pg_get_triggerdef(oid) AS trigger_definition
FROM pg_trigger
WHERE tgrelid = 'admin_users'::regclass
AND tgisinternal = false;

-- Check for functions that might be called by triggers
SELECT 
    p.proname AS function_name,
    pg_get_functiondef(p.oid) AS function_definition
FROM pg_proc p
JOIN pg_trigger t ON t.tgfoid = p.oid
WHERE t.tgrelid = 'admin_users'::regclass;

-- If you find a trigger causing the "Tenant or user not found" error,
-- you can temporarily disable it:
-- ALTER TABLE admin_users DISABLE TRIGGER <trigger_name>;

-- Or drop it if it's not needed:
-- DROP TRIGGER IF EXISTS <trigger_name> ON admin_users;


