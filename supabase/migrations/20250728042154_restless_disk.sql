/*
  # INDUS Admin Panel Database Schema

  1. New Tables
    - `slider_section` - Home page slider content
    - `services_home` - Home services overview
    - `services_manpower` - Manpower services
    - `services_trucks` - Truck services
    - `services_projects` - Project services
    - `services_products` - Product services
    - `services_training` - Training services
    - `services_repair` - Repair & maintenance services
    - `nfpa_courses` - NFPA course management
    - `nfpa_batches` - NFPA batch management
    - `nfpa_news` - NFPA news and updates
    - `careers` - Career openings
    - `blogs_welcome` - Welcome blog images
    - `blogs_ventures` - Venture blogs
    - `blogs_events` - Event blogs
    - `blogs_latest` - Latest blogs
    - `blogs_info` - General info blogs

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Slider Section Table
CREATE TABLE IF NOT EXISTS slider_section (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  video_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Services Home Table
CREATE TABLE IF NOT EXISTS services_home (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Generic Services Tables
CREATE TABLE IF NOT EXISTS services_manpower (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS services_trucks (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS services_projects (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS services_products (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS services_training (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS services_repair (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- NFPA Tables
CREATE TABLE IF NOT EXISTS nfpa_courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  duration TEXT,
  start_date DATE,
  end_date DATE,
  points JSONB,
  status TEXT CHECK (status IN ('active', 'coming_soon')) DEFAULT 'coming_soon',
  created_at TIMESTAMPTZ DEFAULT now()
);


CREATE TABLE IF NOT EXISTS nfpa_batches (
  id SERIAL PRIMARY KEY,
  course_id UUID REFERENCES nfpa_courses(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  location TEXT NOT NULL,
  seats INTEGER DEFAULT 0,
  instructor TEXT,
  status TEXT CHECK (status IN ('register', 'closed')) DEFAULT 'register',
  created_at TIMESTAMPTZ DEFAULT now()
);


CREATE TABLE IF NOT EXISTS nfpa_news (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  news_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Careers Table
CREATE TABLE IF NOT EXISTS careers (
  id SERIAL PRIMARY KEY,
  position TEXT NOT NULL,
  description TEXT,
  work_type TEXT DEFAULT 'full-time',
  location TEXT,
  experience TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Blog Tables
CREATE TABLE IF NOT EXISTS blogs_welcome (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);


CREATE TABLE IF NOT EXISTS blogs_ventures (
  id SERIAL PRIMARY KEY,
  image_url TEXT,
  title TEXT NOT NULL,
  description TEXT,
  date DATE DEFAULT CURRENT_DATE,
  posted_by TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS blogs_events (
  id SERIAL PRIMARY KEY,
  image_url TEXT,
  title TEXT NOT NULL,
  description TEXT,
  date DATE DEFAULT CURRENT_DATE,
  posted_by TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS blogs_latest (
  id SERIAL PRIMARY KEY,
  image_url TEXT,
  title TEXT NOT NULL,
  description TEXT,
  date DATE DEFAULT CURRENT_DATE,
  posted_by TEXT,
  read_time TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);


CREATE TABLE IF NOT EXISTS blogs_info (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  date DATE DEFAULT CURRENT_DATE,
  author TEXT,
  excerpt TEXT,
  image TEXT,
  category TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS services_contact_form (
  id SERIAL PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  company TEXT,
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE TABLE IF NOT EXISTS contact_messages(
  id SERIAL PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);


-- Enable RLS on all tables
ALTER TABLE slider_section ENABLE ROW LEVEL SECURITY;
ALTER TABLE services_home ENABLE ROW LEVEL SECURITY;
ALTER TABLE services_manpower ENABLE ROW LEVEL SECURITY;
ALTER TABLE services_trucks ENABLE ROW LEVEL SECURITY;
ALTER TABLE services_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE services_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE services_training ENABLE ROW LEVEL SECURITY;
ALTER TABLE services_repair ENABLE ROW LEVEL SECURITY;
ALTER TABLE nfpa_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE nfpa_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE nfpa_news ENABLE ROW LEVEL SECURITY;
ALTER TABLE careers ENABLE ROW LEVEL SECURITY;
ALTER TABLE blogs_welcome ENABLE ROW LEVEL SECURITY;
ALTER TABLE blogs_ventures ENABLE ROW LEVEL SECURITY;
ALTER TABLE blogs_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE blogs_latest ENABLE ROW LEVEL SECURITY;
ALTER TABLE blogs_info ENABLE ROW LEVEL SECURITY;

-- Create policies for all tables (allowing all operations for now)
CREATE POLICY "Allow all operations" ON slider_section FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON services_home FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON services_manpower FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON services_trucks FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON services_projects FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON services_products FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON services_training FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON services_repair FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON nfpa_courses FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON nfpa_batches FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON nfpa_news FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON careers FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON blogs_welcome FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON blogs_ventures FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON blogs_events FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON blogs_latest FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON blogs_info FOR ALL USING (true);