-- ============================================================
-- HATMANN NewsVortex - Complete Supabase Schema
-- Version 2.0 - Optimized with RLS Policies
-- ============================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. CLEANUP (Run only on fresh reset)
-- DROP TABLE IF EXISTS rundown_items CASCADE;
-- DROP TABLE IF EXISTS rundowns CASCADE;
-- DROP TABLE IF EXISTS show_instances CASCADE;
-- DROP TABLE IF EXISTS shows CASCADE;
-- DROP TABLE IF EXISTS stories CASCADE;
-- DROP TABLE IF EXISTS categories CASCADE;
-- DROP TABLE IF EXISTS station_members CASCADE;
-- DROP TABLE IF EXISTS stations CASCADE;
-- DROP TABLE IF EXISTS users CASCADE;
-- DROP TYPE IF EXISTS story_status, priority_level, rundown_status, item_status, rundown_item_type CASCADE;

-- ============================================================
-- 3. ENUMS
-- ============================================================
DO $$ BEGIN
  CREATE TYPE story_status AS ENUM ('DRAFT', 'PENDING', 'APPROVED', 'PUBLISHED', 'KILLED');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE priority_level AS ENUM ('LOW', 'NORMAL', 'HIGH', 'URGENT');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN  
  CREATE TYPE rundown_status AS ENUM ('DRAFT', 'FINAL', 'ARCHIVED');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE item_status AS ENUM ('PENDING', 'READY', 'LIVE', 'COMPLETED');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE rundown_item_type AS ENUM ('STORY', 'BREAK', 'LIVE', 'INTERVIEW', 'PROMO', 'MUSIC', 'AD');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================
-- 4. CORE TABLES
-- ============================================================

-- Users (synced with auth.users)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  first_name TEXT NOT NULL DEFAULT 'System',
  last_name TEXT NOT NULL DEFAULT 'User',
  avatar_url TEXT,
  role TEXT DEFAULT 'editor',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Stations (Radio stations/newsrooms)
CREATE TABLE IF NOT EXISTS stations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  call_sign TEXT UNIQUE NOT NULL,
  frequency TEXT,
  city TEXT,
  timezone TEXT DEFAULT 'Africa/Lagos',
  logo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Station Members (Many-to-many: users <-> stations)
CREATE TABLE IF NOT EXISTS station_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  station_id UUID NOT NULL REFERENCES stations(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'editor', -- admin, editor, viewer
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, station_id)
);

-- Categories
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  color TEXT DEFAULT '#6366f1',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Stories
CREATE TABLE IF NOT EXISTS stories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT,
  body JSONB DEFAULT '{"type": "doc", "content": []}'::jsonb,
  plain_text TEXT,
  status story_status DEFAULT 'DRAFT',
  priority priority_level DEFAULT 'NORMAL',
  author_id UUID REFERENCES users(id) ON DELETE SET NULL,
  station_id UUID NOT NULL REFERENCES stations(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  source TEXT,
  word_count INTEGER DEFAULT 0,
  read_time INTEGER GENERATED ALWAYS AS (GREATEST(1, word_count / 150)) STORED,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 5. PRODUCTION TABLES (Shows & Rundowns)
-- ============================================================

-- Shows (Recurring broadcast programs)
CREATE TABLE IF NOT EXISTS shows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  station_id UUID NOT NULL REFERENCES stations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT,
  description TEXT,
  default_duration INTEGER DEFAULT 3600, -- in seconds
  start_time TIME,
  days_of_week INTEGER[] DEFAULT ARRAY[1,2,3,4,5], -- 0=Sun, 1=Mon, etc.
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Show Instances (Specific broadcast occurrences)
CREATE TABLE IF NOT EXISTS show_instances (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  show_id UUID NOT NULL REFERENCES shows(id) ON DELETE CASCADE,
  air_date DATE NOT NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'SCHEDULED', -- SCHEDULED, LIVE, COMPLETED, CANCELLED
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Rundowns (The content plan for a show instance)
CREATE TABLE IF NOT EXISTS rundowns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  show_instance_id UUID UNIQUE REFERENCES show_instances(id) ON DELETE CASCADE,
  status rundown_status DEFAULT 'DRAFT',
  total_duration INTEGER DEFAULT 0, -- in seconds
  locked_by UUID REFERENCES users(id) ON DELETE SET NULL,
  locked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Rundown Items (Segments within a rundown)
CREATE TABLE IF NOT EXISTS rundown_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  rundown_id UUID NOT NULL REFERENCES rundowns(id) ON DELETE CASCADE,
  story_id UUID REFERENCES stories(id) ON DELETE SET NULL,
  type rundown_item_type NOT NULL DEFAULT 'STORY',
  title TEXT NOT NULL,
  position INTEGER NOT NULL DEFAULT 0,
  planned_duration INTEGER DEFAULT 120, -- in seconds
  actual_duration INTEGER,
  script TEXT,
  notes TEXT,
  status item_status DEFAULT 'PENDING',
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 6. INDEXES FOR PERFORMANCE
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_stories_station ON stories(station_id);
CREATE INDEX IF NOT EXISTS idx_stories_author ON stories(author_id);
CREATE INDEX IF NOT EXISTS idx_stories_status ON stories(status);
CREATE INDEX IF NOT EXISTS idx_stories_created ON stories(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_shows_station ON shows(station_id);
CREATE INDEX IF NOT EXISTS idx_show_instances_show ON show_instances(show_id);
CREATE INDEX IF NOT EXISTS idx_show_instances_date ON show_instances(air_date DESC);
CREATE INDEX IF NOT EXISTS idx_rundown_items_rundown ON rundown_items(rundown_id);
CREATE INDEX IF NOT EXISTS idx_rundown_items_position ON rundown_items(rundown_id, position);
CREATE INDEX IF NOT EXISTS idx_station_members_user ON station_members(user_id);
CREATE INDEX IF NOT EXISTS idx_station_members_station ON station_members(station_id);

-- ============================================================
-- 7. AUTH SYNC TRIGGER
-- Automatically creates user profile on signup
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, first_name, last_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', 'System'),
    COALESCE(NEW.raw_user_meta_data->>'last_name', 'User')
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    first_name = COALESCE(EXCLUDED.first_name, users.first_name),
    last_name = COALESCE(EXCLUDED.last_name, users.last_name);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- 8. AUTO-UPDATE TIMESTAMPS
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS stories_updated_at ON stories;
CREATE TRIGGER stories_updated_at BEFORE UPDATE ON stories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS shows_updated_at ON shows;
CREATE TRIGGER shows_updated_at BEFORE UPDATE ON shows
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS rundowns_updated_at ON rundowns;
CREATE TRIGGER rundowns_updated_at BEFORE UPDATE ON rundowns
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- 9. ROW LEVEL SECURITY (RLS)
-- ============================================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE stations ENABLE ROW LEVEL SECURITY;
ALTER TABLE station_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE shows ENABLE ROW LEVEL SECURITY;
ALTER TABLE show_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE rundowns ENABLE ROW LEVEL SECURITY;
ALTER TABLE rundown_items ENABLE ROW LEVEL SECURITY;

-- Helper function: Check if user is member of station
CREATE OR REPLACE FUNCTION is_station_member(station_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM station_members 
    WHERE user_id = auth.uid() AND station_id = station_uuid
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- USERS: Users can read all, update own
CREATE POLICY "Users can view all users" ON users FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);

-- STATIONS: Anyone authenticated can read, only admins can modify
CREATE POLICY "Authenticated users can view stations" ON stations FOR SELECT TO authenticated USING (true);
CREATE POLICY "Station admins can update" ON stations FOR UPDATE TO authenticated 
  USING (EXISTS (SELECT 1 FROM station_members WHERE station_id = id AND user_id = auth.uid() AND role = 'admin'));

-- STATION_MEMBERS: Users can see their own memberships, admins can manage
CREATE POLICY "Users can view own memberships" ON station_members FOR SELECT TO authenticated 
  USING (user_id = auth.uid() OR is_station_member(station_id));
CREATE POLICY "Members can be added by admins" ON station_members FOR INSERT TO authenticated
  USING (EXISTS (SELECT 1 FROM station_members sm WHERE sm.station_id = station_id AND sm.user_id = auth.uid() AND sm.role = 'admin'));

-- CATEGORIES: All authenticated can read (global)
CREATE POLICY "Authenticated users can view categories" ON categories FOR SELECT TO authenticated USING (true);

-- STORIES: Station members can CRUD their station's stories
CREATE POLICY "Station members can view stories" ON stories FOR SELECT TO authenticated 
  USING (is_station_member(station_id));
CREATE POLICY "Station members can create stories" ON stories FOR INSERT TO authenticated 
  WITH CHECK (is_station_member(station_id));
CREATE POLICY "Authors/members can update stories" ON stories FOR UPDATE TO authenticated 
  USING (is_station_member(station_id));
CREATE POLICY "Authors/admins can delete stories" ON stories FOR DELETE TO authenticated 
  USING (author_id = auth.uid() OR EXISTS (SELECT 1 FROM station_members WHERE station_id = stories.station_id AND user_id = auth.uid() AND role = 'admin'));

-- SHOWS: Station members can manage shows
CREATE POLICY "Station members can view shows" ON shows FOR SELECT TO authenticated 
  USING (is_station_member(station_id));
CREATE POLICY "Station members can create shows" ON shows FOR INSERT TO authenticated 
  WITH CHECK (is_station_member(station_id));
CREATE POLICY "Station members can update shows" ON shows FOR UPDATE TO authenticated 
  USING (is_station_member(station_id));

-- SHOW INSTANCES: Access via show's station
CREATE POLICY "Station members can view show instances" ON show_instances FOR SELECT TO authenticated 
  USING (EXISTS (SELECT 1 FROM shows WHERE shows.id = show_id AND is_station_member(shows.station_id)));
CREATE POLICY "Station members can create show instances" ON show_instances FOR INSERT TO authenticated 
  WITH CHECK (EXISTS (SELECT 1 FROM shows WHERE shows.id = show_id AND is_station_member(shows.station_id)));

-- RUNDOWNS: Access via show instance's station
CREATE POLICY "Station members can view rundowns" ON rundowns FOR SELECT TO authenticated 
  USING (EXISTS (
    SELECT 1 FROM show_instances si 
    JOIN shows s ON si.show_id = s.id 
    WHERE si.id = show_instance_id AND is_station_member(s.station_id)
  ));
CREATE POLICY "Station members can create rundowns" ON rundowns FOR INSERT TO authenticated 
  WITH CHECK (EXISTS (
    SELECT 1 FROM show_instances si 
    JOIN shows s ON si.show_id = s.id 
    WHERE si.id = show_instance_id AND is_station_member(s.station_id)
  ));
CREATE POLICY "Station members can update rundowns" ON rundowns FOR UPDATE TO authenticated 
  USING (EXISTS (
    SELECT 1 FROM show_instances si 
    JOIN shows s ON si.show_id = s.id 
    WHERE si.id = show_instance_id AND is_station_member(s.station_id)
  ));

-- RUNDOWN ITEMS: Access via rundown's station
CREATE POLICY "Station members can view rundown items" ON rundown_items FOR SELECT TO authenticated 
  USING (EXISTS (
    SELECT 1 FROM rundowns r
    JOIN show_instances si ON r.show_instance_id = si.id
    JOIN shows s ON si.show_id = s.id
    WHERE r.id = rundown_id AND is_station_member(s.station_id)
  ));
CREATE POLICY "Station members can manage rundown items" ON rundown_items FOR ALL TO authenticated 
  USING (EXISTS (
    SELECT 1 FROM rundowns r
    JOIN show_instances si ON r.show_instance_id = si.id
    JOIN shows s ON si.show_id = s.id
    WHERE r.id = rundown_id AND is_station_member(s.station_id)
  ));

-- ============================================================
-- 10. SEED DATA
-- ============================================================
INSERT INTO stations (name, call_sign, frequency, city) VALUES 
  ('Freedom Radio Kano', 'FRKANO', '99.5 FM', 'Kano'),
  ('Freedom Radio Dutse', 'FRDUTSE', '99.5 FM', 'Dutse'),
  ('Freedom Radio Kaduna', 'FRKADUNA', '92.9 FM', 'Kaduna'),
  ('Dala FM Kano', 'DALAFM', '88.5 FM', 'Kano')
ON CONFLICT (call_sign) DO NOTHING;

INSERT INTO categories (name, slug, color) VALUES 
  ('Politics', 'politics', '#ef4444'),
  ('Business', 'business', '#22c55e'),
  ('Health', 'health', '#06b6d4'),
  ('Technology', 'technology', '#8b5cf6'),
  ('Sports', 'sports', '#f97316'),
  ('Entertainment', 'entertainment', '#ec4899'),
  ('Breaking News', 'breaking', '#dc2626')
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- 11. HELPER FUNCTIONS (Callable from client)
-- ============================================================

-- Get user's stations
CREATE OR REPLACE FUNCTION get_my_stations()
RETURNS SETOF stations AS $$
BEGIN
  RETURN QUERY
    SELECT s.* FROM stations s
    INNER JOIN station_members sm ON s.id = sm.station_id
    WHERE sm.user_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Auto-join first station on signup (for demo purposes)
CREATE OR REPLACE FUNCTION auto_join_default_station()
RETURNS TRIGGER AS $$
DECLARE
  default_station_id UUID;
BEGIN
  SELECT id INTO default_station_id FROM stations ORDER BY created_at LIMIT 1;
  IF default_station_id IS NOT NULL THEN
    INSERT INTO station_members (user_id, station_id, role)
    VALUES (NEW.id, default_station_id, 'editor')
    ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_user_created_join_station ON users;
CREATE TRIGGER on_user_created_join_station
  AFTER INSERT ON users
  FOR EACH ROW EXECUTE FUNCTION auto_join_default_station();

-- Calculate rundown total duration
CREATE OR REPLACE FUNCTION calculate_rundown_duration(rundown_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
  total INTEGER;
BEGIN
  SELECT COALESCE(SUM(planned_duration), 0) INTO total
  FROM rundown_items WHERE rundown_id = rundown_uuid;
  
  UPDATE rundowns SET total_duration = total WHERE id = rundown_uuid;
  RETURN total;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;