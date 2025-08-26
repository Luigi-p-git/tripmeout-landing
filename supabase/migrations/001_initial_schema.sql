-- Trip Planner Database Schema
-- Initial migration to create core tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trips table
CREATE TABLE public.trips (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  start_date DATE,
  end_date DATE,
  status TEXT DEFAULT 'planning' CHECK (status IN ('planning', 'active', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Destinations table
CREATE TABLE public.destinations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  trip_id UUID REFERENCES public.trips(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activities table
CREATE TABLE public.activities (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  destination_id UUID REFERENCES public.destinations(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  duration INTEGER, -- in minutes
  cost DECIMAL(10, 2),
  category TEXT DEFAULT 'general' CHECK (category IN ('accommodation', 'food', 'transport', 'entertainment', 'sightseeing', 'general')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.destinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for trips table
CREATE POLICY "Users can view own trips" ON public.trips
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own trips" ON public.trips
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own trips" ON public.trips
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own trips" ON public.trips
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for destinations table
CREATE POLICY "Users can view destinations of own trips" ON public.destinations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.trips 
      WHERE trips.id = destinations.trip_id 
      AND trips.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create destinations for own trips" ON public.destinations
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.trips 
      WHERE trips.id = destinations.trip_id 
      AND trips.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update destinations of own trips" ON public.destinations
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.trips 
      WHERE trips.id = destinations.trip_id 
      AND trips.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete destinations of own trips" ON public.destinations
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.trips 
      WHERE trips.id = destinations.trip_id 
      AND trips.user_id = auth.uid()
    )
  );

-- RLS Policies for activities table
CREATE POLICY "Users can view activities of own trips" ON public.activities
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.destinations 
      JOIN public.trips ON trips.id = destinations.trip_id
      WHERE destinations.id = activities.destination_id 
      AND trips.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create activities for own trips" ON public.activities
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.destinations 
      JOIN public.trips ON trips.id = destinations.trip_id
      WHERE destinations.id = activities.destination_id 
      AND trips.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update activities of own trips" ON public.activities
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.destinations 
      JOIN public.trips ON trips.id = destinations.trip_id
      WHERE destinations.id = activities.destination_id 
      AND trips.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete activities of own trips" ON public.activities
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.destinations 
      JOIN public.trips ON trips.id = destinations.trip_id
      WHERE destinations.id = activities.destination_id 
      AND trips.user_id = auth.uid()
    )
  );

-- Grant permissions to anon and authenticated roles
GRANT SELECT, INSERT, UPDATE, DELETE ON public.users TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.trips TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.destinations TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.activities TO authenticated;

-- Grant basic read access to anon role (for public data if needed)
GRANT SELECT ON public.users TO anon;
GRANT SELECT ON public.trips TO anon;
GRANT SELECT ON public.destinations TO anon;
GRANT SELECT ON public.activities TO anon;

-- Create indexes for better performance
CREATE INDEX idx_trips_user_id ON public.trips(user_id);
CREATE INDEX idx_destinations_trip_id ON public.destinations(trip_id);
CREATE INDEX idx_activities_destination_id ON public.activities(destination_id);
CREATE INDEX idx_trips_status ON public.trips(status);
CREATE INDEX idx_destinations_order ON public.destinations(trip_id, order_index);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to automatically update updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_trips_updated_at BEFORE UPDATE ON public.trips
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create user profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();