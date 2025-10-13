-- Create test user for App Store review
-- Username: appstore_reviewer
-- Email: appstoretester@stogie.app
-- Password: TestStogie2025!

-- Note: You'll need to create this user through your backend's signup endpoint
-- or directly in Supabase Auth dashboard

-- This SQL is just for reference. To create the actual user:
-- 1. Go to your Supabase Dashboard
-- 2. Navigate to Authentication → Users
-- 3. Click "Add User" (via email)
-- 4. Use these credentials:
--    Email: appstoretester@stogie.app
--    Password: TestStogie2025!
--    Auto Confirm: Yes
-- 5. Then run the profile creation below

-- After creating in Auth, insert the profile:
-- INSERT INTO profiles (id, username, full_name, bio, created_at, updated_at)
-- VALUES (
--   '[USER_ID_FROM_AUTH]',
--   'appstore_reviewer',
--   'App Store Reviewer',
--   'Test account for Apple review team',
--   NOW(),
--   NOW()
-- );

-- Sample data for testing:
-- You can add some sample cigars to this user's humidor after creation

