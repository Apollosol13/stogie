-- Add moderation features for Apple App Store Guideline 1.2 compliance
-- This includes content reporting and user blocking functionality

-- Table for content reports (posts, comments)
CREATE TABLE IF NOT EXISTS content_reports (
  id BIGSERIAL PRIMARY KEY,
  reporter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content_type VARCHAR(20) NOT NULL CHECK (content_type IN ('post', 'comment')),
  content_id BIGINT NOT NULL,
  reason TEXT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'action_taken', 'dismissed')),
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(reporter_id, content_type, content_id)
);

-- Table for blocked users
CREATE TABLE IF NOT EXISTS blocked_users (
  id BIGSERIAL PRIMARY KEY,
  blocker_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  blocked_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(blocker_id, blocked_id),
  CHECK (blocker_id != blocked_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_content_reports_status ON content_reports(status);
CREATE INDEX IF NOT EXISTS idx_content_reports_reporter ON content_reports(reporter_id);
CREATE INDEX IF NOT EXISTS idx_content_reports_created ON content_reports(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_blocked_users_blocker ON blocked_users(blocker_id);
CREATE INDEX IF NOT EXISTS idx_blocked_users_blocked ON blocked_users(blocked_id);

-- Row Level Security (RLS) Policies

-- Content Reports: Users can create reports, admins can view all
ALTER TABLE content_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create reports" ON content_reports
  FOR INSERT
  WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Users can view their own reports" ON content_reports
  FOR SELECT
  USING (auth.uid() = reporter_id);

-- Blocked Users: Users can manage their own blocks
ALTER TABLE blocked_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can block others" ON blocked_users
  FOR INSERT
  WITH CHECK (auth.uid() = blocker_id);

CREATE POLICY "Users can view their blocks" ON blocked_users
  FOR SELECT
  USING (auth.uid() = blocker_id);

CREATE POLICY "Users can unblock" ON blocked_users
  FOR DELETE
  USING (auth.uid() = blocker_id);

-- Comments
-- Grant permissions to service role
GRANT ALL ON content_reports TO service_role;
GRANT ALL ON blocked_users TO service_role;
GRANT USAGE, SELECT ON SEQUENCE content_reports_id_seq TO service_role;
GRANT USAGE, SELECT ON SEQUENCE blocked_users_id_seq TO service_role;

