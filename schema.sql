-- HATMANN NewsVortex - Master Database Reset & Migration
-- Optimized for Supabase / PostgreSQL

-- 1. DESTRUCTIVE CLEANUP (Full Reset)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

DROP TABLE IF EXISTS rundown_items CASCADE;
DROP TABLE IF EXISTS rundowns CASCADE;
DROP TABLE IF EXISTS show_instances CASCADE;
DROP TABLE IF EXISTS shows CASCADE;
DROP TABLE IF EXISTS stories CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS stations CASCADE;
DROP TABLE IF EXISTS users CASCADE;

DROP TYPE IF EXISTS story_status CASCADE;
DROP TYPE IF EXISTS priority_level CASCADE;
DROP TYPE IF EXISTS rundown_status CASCADE;
DROP TYPE IF EXISTS item_status CASCADE;
DROP TYPE IF EXISTS rundown_item_type CASCADE;

-- 2. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 3. ENUMS
CREATE TYPE story_status AS ENUM ('DRAFT', 'PENDING', 'APPROVED', 'PUBLISHED', 'KILLED');
CREATE TYPE priority_level AS ENUM ('LOW', 'NORMAL', 'HIGH', 'URGENT');
CREATE TYPE rundown_status AS ENUM ('DRAFT', 'FINAL', 'ARCHIVED');
CREATE TYPE item_status AS ENUM ('PENDING', 'READY', 'LIVE', 'COMPLETED');
CREATE TYPE rundown_item_type AS ENUM ('STORY', 'BREAK', 'LIVE', 'INTERVIEW', 'PROMO', 'MUSIC', 'AD');

-- 4. CORE TABLES
CREATE TABLE users (
    id UUID PRIMARY KEY, -- Linked to auth.users.id
    email TEXT UNIQUE NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE stations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    call_sign TEXT UNIQUE NOT NULL,
    frequency TEXT,
    city TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL
);

CREATE TABLE stories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    body JSONB DEFAULT '{"content": ""}'::jsonb,
    plain_text TEXT,
    status story_status DEFAULT 'DRAFT',
    priority priority_level DEFAULT 'NORMAL',
    author_id UUID REFERENCES users(id) ON DELETE SET NULL,
    station_id UUID REFERENCES stations(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    word_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. PRODUCTION TABLES
CREATE TABLE shows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    station_id UUID REFERENCES stations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    default_duration INTEGER DEFAULT 60,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE show_instances (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    show_id UUID REFERENCES shows(id) ON DELETE CASCADE,
    air_date DATE NOT NULL,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    status TEXT DEFAULT 'SCHEDULED',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE rundowns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    show_instance_id UUID REFERENCES show_instances(id) ON DELETE CASCADE,
    status rundown_status DEFAULT 'DRAFT',
    total_duration INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE rundown_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rundown_id UUID REFERENCES rundowns(id) ON DELETE CASCADE,
    story_id UUID REFERENCES stories(id) ON DELETE SET NULL,
    type rundown_item_type NOT NULL,
    title TEXT NOT NULL,
    position INTEGER NOT NULL,
    planned_duration INTEGER DEFAULT 0,
    script TEXT,
    notes TEXT,
    status item_status DEFAULT 'PENDING',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. AUTH SYNC TRIGGER
-- This automatically creates a public user profile when a new user signs up via Supabase Auth.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, first_name, last_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', 'System'),
    COALESCE(NEW.raw_user_meta_data->>'last_name', 'User')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 7. INITIAL SEED DATA
INSERT INTO stations (name, call_sign, frequency, city) 
VALUES 
('Freedom Radio Kano', 'FRKANO', '99.5 FM', 'Kano'),
('Freedom Radio Dutse', 'FRDUTSE', '99.5 FM', 'Dutse'),
('Freedom Radio Kaduna', 'FRKADUNA', '92.9 FM', 'Kaduna');

INSERT INTO categories (name, slug) 
VALUES 
('Politics', 'politics'),
('Business', 'business'),
('Health', 'health'),
('Technology', 'technology');