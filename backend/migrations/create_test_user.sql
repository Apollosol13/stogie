-- Create a test user profile (you'll need to create the auth user first via Supabase Dashboard)
-- After creating auth user with email: test@stogie.app / password: TestStogie123!
-- Get the user_id from auth.users and use it below

-- Example: Replace 'USER_ID_HERE' with the actual UUID from auth.users
/*
INSERT INTO profiles (id, username, full_name, bio, avatar_url, created_at, updated_at)
VALUES (
  'USER_ID_HERE',
  'stogietest',
  'Stogie Test',
  'Test account for Stogie app 🔥 | Cigar enthusiast | Testing features',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=stogietest&backgroundColor=b6e3f4',
  NOW(),
  NOW()
)
ON CONFLICT (id) DO NOTHING;

-- Create some test posts for the test user
INSERT INTO posts (user_id, image_url, caption, created_at)
VALUES 
(
  'USER_ID_HERE',
  'https://images.unsplash.com/photo-1606572246049-c7e8bc049e19?w=800&h=800&fit=crop',
  'My first cigar of the day! Nothing beats a morning smoke ☕🔥',
  NOW() - INTERVAL '2 hours'
),
(
  'USER_ID_HERE',
  'https://images.unsplash.com/photo-1609840114348-9c63676f97bb?w=800&h=800&fit=crop',
  'Perfect pairing with some whiskey 🥃 What''s your favorite pairing?',
  NOW() - INTERVAL '1 day'
),
(
  'USER_ID_HERE',
  'https://images.unsplash.com/photo-1593697821028-7cc59bfbf5b6?w=800&h=800&fit=crop',
  'Relaxing after a long week. Cheers! 🍻',
  NOW() - INTERVAL '3 days'
)
ON CONFLICT DO NOTHING;
*/

-- Instructions:
-- 1. Go to Supabase Dashboard → Authentication → Users
-- 2. Click "Add user" → "Create new user"
-- 3. Email: test@stogie.app
-- 4. Password: TestStogie123!
-- 5. Auto Confirm User: YES
-- 6. Copy the User UID
-- 7. Uncomment the SQL above and replace 'USER_ID_HERE' with the copied UID
-- 8. Run this SQL in the SQL Editor

