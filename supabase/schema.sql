-- ============================================================
-- PACTUM DATABASE SCHEMA
-- Run this in your Supabase SQL editor (Dashboard > SQL Editor)
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- PROFILES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  age INTEGER CHECK (age >= 13 AND age <= 120),
  city TEXT,
  skills TEXT[] DEFAULT '{}',
  interests TEXT[] DEFAULT '{}',
  goals TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================================
-- IDEAS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS ideas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  required_skills TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Only one active idea per user (enforced via partial unique index)
CREATE UNIQUE INDEX IF NOT EXISTS ideas_one_active_per_owner
  ON ideas(owner_id)
  WHERE is_active = TRUE;

-- ============================================================
-- SWIPES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS swipes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  swiper_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  idea_id UUID NOT NULL REFERENCES ideas(id) ON DELETE CASCADE,
  direction TEXT NOT NULL CHECK (direction IN ('left', 'right')),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(swiper_id, idea_id)
);

-- ============================================================
-- MATCHES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  idea_id UUID NOT NULL REFERENCES ideas(id) ON DELETE CASCADE,
  idea_owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  interested_user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'matched', 'declined')),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(idea_id, interested_user_id)
);

-- ============================================================
-- MESSAGES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  read_at TIMESTAMPTZ
);

-- ============================================================
-- PACTUMS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS pactums (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  owner_role TEXT NOT NULL,
  collaborator_role TEXT NOT NULL,
  terms TEXT NOT NULL,
  owner_signed_at TIMESTAMPTZ,
  collaborator_signed_at TIMESTAMPTZ,
  created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(match_id) -- one pactum per match
);

-- ============================================================
-- UPDATED_AT TRIGGER FUNCTION
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER update_ideas_updated_at
  BEFORE UPDATE ON ideas
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER update_matches_updated_at
  BEFORE UPDATE ON matches
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER update_pactums_updated_at
  BEFORE UPDATE ON pactums
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- AUTO-CREATE PROFILE ON SIGNUP
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (
    NEW.id,
    COALESCE(
      NULLIF(TRIM(NEW.raw_user_meta_data->>'full_name'), ''),
      NULLIF(SPLIT_PART(NEW.email, '@', 1), ''),
      'New User'
    )
  );

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'handle_new_user failed for user %: %', NEW.id, SQLERRM;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE swipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE pactums ENABLE ROW LEVEL SECURITY;

-- PROFILES policies
DROP POLICY IF EXISTS "Profiles are viewable by authenticated users" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;

CREATE POLICY "Profiles are viewable by authenticated users"
  ON profiles FOR SELECT TO authenticated USING (TRUE);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

-- IDEAS policies
DROP POLICY IF EXISTS "Ideas are viewable by authenticated users" ON ideas;
DROP POLICY IF EXISTS "Users can create ideas" ON ideas;
DROP POLICY IF EXISTS "Users can update their own ideas" ON ideas;
DROP POLICY IF EXISTS "Users can delete their own ideas" ON ideas;

CREATE POLICY "Ideas are viewable by authenticated users"
  ON ideas FOR SELECT TO authenticated USING (TRUE);

CREATE POLICY "Users can create ideas"
  ON ideas FOR INSERT TO authenticated WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update their own ideas"
  ON ideas FOR UPDATE TO authenticated USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete their own ideas"
  ON ideas FOR DELETE TO authenticated USING (auth.uid() = owner_id);

-- SWIPES policies
DROP POLICY IF EXISTS "Users can view their own swipes" ON swipes;
DROP POLICY IF EXISTS "Idea owners can view swipes on their ideas" ON swipes;
DROP POLICY IF EXISTS "Users can create swipes" ON swipes;

CREATE POLICY "Users can view their own swipes"
  ON swipes FOR SELECT TO authenticated USING (auth.uid() = swiper_id);

CREATE POLICY "Idea owners can view swipes on their ideas"
  ON swipes FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM ideas WHERE ideas.id = swipes.idea_id AND ideas.owner_id = auth.uid()
  ));

CREATE POLICY "Users can create swipes"
  ON swipes FOR INSERT TO authenticated WITH CHECK (auth.uid() = swiper_id);

-- MATCHES policies
DROP POLICY IF EXISTS "Users can view their own matches" ON matches;
DROP POLICY IF EXISTS "Idea owners can create matches (approve/decline)" ON matches;
DROP POLICY IF EXISTS "Idea owners can update match status" ON matches;

CREATE POLICY "Users can view their own matches"
  ON matches FOR SELECT TO authenticated
  USING (auth.uid() = idea_owner_id OR auth.uid() = interested_user_id);

CREATE POLICY "Idea owners can create matches (approve/decline)"
  ON matches FOR INSERT TO authenticated WITH CHECK (auth.uid() = idea_owner_id);

CREATE POLICY "Idea owners can update match status"
  ON matches FOR UPDATE TO authenticated USING (auth.uid() = idea_owner_id);

-- MESSAGES policies
DROP POLICY IF EXISTS "Match participants can view messages" ON messages;
DROP POLICY IF EXISTS "Match participants can send messages" ON messages;
DROP POLICY IF EXISTS "Sender can update their messages (mark read)" ON messages;

CREATE POLICY "Match participants can view messages"
  ON messages FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM matches
    WHERE matches.id = messages.match_id
    AND (matches.idea_owner_id = auth.uid() OR matches.interested_user_id = auth.uid())
  ));

CREATE POLICY "Match participants can send messages"
  ON messages FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM matches
      WHERE matches.id = messages.match_id
      AND matches.status = 'matched'
      AND (matches.idea_owner_id = auth.uid() OR matches.interested_user_id = auth.uid())
    )
  );

CREATE POLICY "Sender can update their messages (mark read)"
  ON messages FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM matches
    WHERE matches.id = messages.match_id
    AND (matches.idea_owner_id = auth.uid() OR matches.interested_user_id = auth.uid())
  ));

-- PACTUMS policies
DROP POLICY IF EXISTS "Match participants can view pactums" ON pactums;
DROP POLICY IF EXISTS "Match participants can create pactums" ON pactums;
DROP POLICY IF EXISTS "Match participants can update pactums (sign)" ON pactums;

CREATE POLICY "Match participants can view pactums"
  ON pactums FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM matches
    WHERE matches.id = pactums.match_id
    AND (matches.idea_owner_id = auth.uid() OR matches.interested_user_id = auth.uid())
  ));

CREATE POLICY "Match participants can create pactums"
  ON pactums FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = created_by AND
    EXISTS (
      SELECT 1 FROM matches
      WHERE matches.id = pactums.match_id
      AND matches.status = 'matched'
      AND (matches.idea_owner_id = auth.uid() OR matches.interested_user_id = auth.uid())
    )
  );

CREATE POLICY "Match participants can update pactums (sign)"
  ON pactums FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM matches
    WHERE matches.id = pactums.match_id
    AND (matches.idea_owner_id = auth.uid() OR matches.interested_user_id = auth.uid())
  ));

-- ============================================================
-- REALTIME SUBSCRIPTIONS
-- ============================================================
-- Enable realtime for messages and matches
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE messages;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE matches;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
