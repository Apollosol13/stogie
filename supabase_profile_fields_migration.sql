-- Add missing profile fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS experience_level TEXT DEFAULT 'beginner',
ADD COLUMN IF NOT EXISTS favorite_strength TEXT DEFAULT 'medium',
ADD COLUMN IF NOT EXISTS favorite_wrapper TEXT;

-- Add comments for documentation
COMMENT ON COLUMN public.profiles.experience_level IS 'User cigar experience level (beginner, intermediate, expert)';
COMMENT ON COLUMN public.profiles.favorite_strength IS 'Preferred cigar strength (mild, medium, full)';
COMMENT ON COLUMN public.profiles.favorite_wrapper IS 'Preferred wrapper type';

-- Add check constraints for valid values
ALTER TABLE public.profiles 
ADD CONSTRAINT check_experience_level 
CHECK (experience_level IN ('beginner', 'intermediate', 'expert'));

ALTER TABLE public.profiles 
ADD CONSTRAINT check_favorite_strength 
CHECK (favorite_strength IN ('mild', 'medium', 'full'));
