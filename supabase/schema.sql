CREATE TYPE college_enum AS ENUM (
  'CCSICT',
  'COE',
  'CA',
  'CON',
  'CBAPA',
  'CCJE',
  'CED',
  'CAS',
  'SVM',
  'IOF',
  'COM'
);

CREATE TYPE user_role AS ENUM (
  'player',
  'quest_giver',
  'game_master'
);

CREATE TYPE quest_status AS ENUM (
  'available',
  'in_progress',
  'completed',
  'expired'
);

CREATE TYPE quest_difficulty AS ENUM (
  'common',
  'uncommon',
  'rare',
  'epic',
  'legendary'
);

CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  student_id TEXT NOT NULL UNIQUE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  college college_enum NOT NULL,
  role user_role NOT NULL DEFAULT 'player',
  xp INTEGER NOT NULL DEFAULT 0,
  gold INTEGER NOT NULL DEFAULT 100,
  level INTEGER NOT NULL DEFAULT 1,
  avatar_url TEXT,
  activity_streak INTEGER NOT NULL DEFAULT 0,
  last_active_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE quests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  short_description TEXT NOT NULL,
  difficulty quest_difficulty NOT NULL DEFAULT 'common',
  xp_reward INTEGER NOT NULL,
  gold_reward INTEGER NOT NULL,
  requirements JSONB NOT NULL,
  starts_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  max_participants INTEGER,
  current_participants INTEGER NOT NULL DEFAULT 0,
  created_by_id UUID NOT NULL REFERENCES user_profiles(id),
  target_colleges college_enum[],
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE user_quest_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  quest_id UUID NOT NULL REFERENCES quests(id) ON DELETE CASCADE,
  status quest_status NOT NULL DEFAULT 'in_progress',
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  proof_url TEXT,
  verified_by_id UUID REFERENCES user_profiles(id),
  verified_at TIMESTAMPTZ,
  xp_awarded INTEGER NOT NULL DEFAULT 0,
  gold_awarded INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, quest_id)
);

CREATE TABLE activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  icon_url TEXT,
  xp_bonus INTEGER NOT NULL DEFAULT 0,
  requirement JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE student_clusters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  cluster_label TEXT NOT NULL,
  cluster_description TEXT,
  quest_completion_rate NUMERIC(5, 4),
  average_session_duration NUMERIC(10, 2),
  social_interaction_score NUMERIC(5, 4),
  attrition_risk NUMERIC(5, 4),
  analyzed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE VIEW guild_leaderboard AS
SELECT
  college,
  COUNT(*) AS total_members,
  SUM(xp) AS total_xp,
  AVG(level) AS average_level,
  RANK() OVER (ORDER BY SUM(xp) DESC) AS rank
FROM user_profiles
GROUP BY college
ORDER BY total_xp DESC;

CREATE INDEX idx_user_profiles_college ON user_profiles(college);
CREATE INDEX idx_user_profiles_xp ON user_profiles(xp DESC);
CREATE INDEX idx_quests_active ON quests(is_active, expires_at);
CREATE INDEX idx_quests_difficulty ON quests(difficulty);
CREATE INDEX idx_user_quest_logs_user ON user_quest_logs(user_id);
CREATE INDEX idx_user_quest_logs_quest ON user_quest_logs(quest_id);
CREATE INDEX idx_user_quest_logs_status ON user_quest_logs(status);
CREATE INDEX idx_activity_logs_user ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_created ON activity_logs(created_at DESC);
CREATE INDEX idx_notifications_user ON notifications(user_id, is_read);

CREATE OR REPLACE FUNCTION update_level()
RETURNS TRIGGER AS $$
BEGIN
  NEW.level := FLOOR(NEW.xp / 1000) + 1;
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_level
  BEFORE UPDATE OF xp ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_level();

CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_user_profiles_timestamp
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER trigger_update_quests_timestamp
  BEFORE UPDATE ON quests
  FOR EACH ROW
  EXECUTE FUNCTION update_timestamp();

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE quests ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_quest_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Anyone can view active quests"
  ON quests FOR SELECT
  USING (is_active = true);

CREATE POLICY "Quest givers can create quests"
  ON quests FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND role IN ('quest_giver', 'game_master')
    )
  );

CREATE POLICY "Users can view own quest logs"
  ON user_quest_logs FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own quest logs"
  ON user_quest_logs FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own quest logs"
  ON user_quest_logs FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can view own activity logs"
  ON activity_logs FOR SELECT
  USING (user_id = auth.uid());







