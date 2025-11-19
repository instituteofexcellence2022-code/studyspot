-- Test 1: Check if you can query admin_users table
SELECT COUNT(*) FROM admin_users;

-- Test 2: Try a simple INSERT to see if it works
INSERT INTO admin_users (email, password_hash, first_name, last_name, role, is_active)
VALUES ('test@example.com', 'test_hash', 'Test', 'User', 'student', true)
RETURNING id, email;

-- If the INSERT works, delete the test user
DELETE FROM admin_users WHERE email = 'test@example.com';

-- Test 3: Check database connection info
SELECT current_database(), current_user, version();


