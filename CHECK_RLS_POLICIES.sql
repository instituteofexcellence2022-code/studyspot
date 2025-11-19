-- Check for Row Level Security (RLS) policies on admin_users
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'admin_users';

-- Check if RLS is enabled on admin_users
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables
WHERE tablename = 'admin_users';

-- If RLS is causing issues, you can temporarily disable it:
-- ALTER TABLE admin_users DISABLE ROW LEVEL SECURITY;


