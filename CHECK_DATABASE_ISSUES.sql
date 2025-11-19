-- Check for CHECK constraints on admin_users
SELECT 
    conname AS constraint_name,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'admin_users'::regclass
AND contype = 'c';  -- 'c' = CHECK constraint

-- Check for functions that might validate tenant
SELECT 
    proname AS function_name,
    pg_get_functiondef(oid) AS function_definition
FROM pg_proc
WHERE proname LIKE '%tenant%' 
   OR proname LIKE '%user%'
   OR prosrc LIKE '%Tenant or user not found%';

-- Check for foreign key constraints
SELECT 
    conname AS constraint_name,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'admin_users'::regclass
AND contype = 'f';  -- 'f' = FOREIGN KEY

-- Check if tenant_id has any special constraints
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'admin_users'
AND column_name = 'tenant_id';


