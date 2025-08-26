import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

/**
 * Supabase client instance for database operations and authentication
 * Configured with environment variables for URL and anonymous key
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

/**
 * Database type definitions for Trip Planner
 */
export interface User {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  created_at: string
  updated_at: string
}

export interface Trip {
  id: string
  user_id: string
  title: string
  description?: string
  start_date?: string
  end_date?: string
  budget?: number
  status: 'planning' | 'active' | 'completed' | 'cancelled'
  created_at: string
  updated_at: string
}

export interface Destination {
  id: string
  trip_id: string
  name: string
  description?: string
  latitude?: number
  longitude?: number
  order_index: number
  created_at: string
}

export interface Activity {
  id: string
  destination_id: string
  name: string
  description?: string
  duration?: number
  cost?: number
  category: 'accommodation' | 'food' | 'transport' | 'entertainment' | 'sightseeing' | 'general'
  created_at: string
}

/**
 * Database helper functions
 */
export const db = {
  // User operations
  users: {
    async getProfile(userId: string) {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()
      
      if (error) throw error
      return data as User
    },
    
    async updateProfile(userId: string, updates: Partial<User>) {
      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', userId)
        .select()
        .single()
      
      if (error) throw error
      return data as User
    }
  },
  
  // Trip operations
  trips: {
    async getAll(userId: string) {
      const { data, error } = await supabase
        .from('trips')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return data as Trip[]
    },
    
    async getById(tripId: string) {
      const { data, error } = await supabase
        .from('trips')
        .select('*')
        .eq('id', tripId)
        .single()
      
      if (error) throw error
      return data as Trip
    },
    
    async create(trip: Omit<Trip, 'id' | 'created_at' | 'updated_at'>) {
      const { data, error } = await supabase
        .from('trips')
        .insert(trip)
        .select()
        .single()
      
      if (error) throw error
      return data as Trip
    },
    
    async update(tripId: string, updates: Partial<Trip>) {
      const { data, error } = await supabase
        .from('trips')
        .update(updates)
        .eq('id', tripId)
        .select()
        .single()
      
      if (error) throw error
      return data as Trip
    },
    
    async delete(tripId: string) {
      const { error } = await supabase
        .from('trips')
        .delete()
        .eq('id', tripId)
      
      if (error) throw error
    }
  },
  
  // Destination operations
  destinations: {
    async getByTripId(tripId: string) {
      const { data, error } = await supabase
        .from('destinations')
        .select('*')
        .eq('trip_id', tripId)
        .order('order_index', { ascending: true })
      
      if (error) throw error
      return data as Destination[]
    },
    
    async create(destination: Omit<Destination, 'id' | 'created_at'>) {
      const { data, error } = await supabase
        .from('destinations')
        .insert(destination)
        .select()
        .single()
      
      if (error) throw error
      return data as Destination
    },
    
    async update(destinationId: string, updates: Partial<Destination>) {
      const { data, error } = await supabase
        .from('destinations')
        .update(updates)
        .eq('id', destinationId)
        .select()
        .single()
      
      if (error) throw error
      return data as Destination
    },
    
    async delete(destinationId: string) {
      const { error } = await supabase
        .from('destinations')
        .delete()
        .eq('id', destinationId)
      
      if (error) throw error
    }
  },
  
  // Activity operations
  activities: {
    async getByDestinationId(destinationId: string) {
      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .eq('destination_id', destinationId)
        .order('created_at', { ascending: true })
      
      if (error) throw error
      return data as Activity[]
    },
    
    async create(activity: Omit<Activity, 'id' | 'created_at'>) {
      const { data, error } = await supabase
        .from('activities')
        .insert(activity)
        .select()
        .single()
      
      if (error) throw error
      return data as Activity
    },
    
    async update(activityId: string, updates: Partial<Activity>) {
      const { data, error } = await supabase
        .from('activities')
        .update(updates)
        .eq('id', activityId)
        .select()
        .single()
      
      if (error) throw error
      return data as Activity
    },
    
    async delete(activityId: string) {
      const { error } = await supabase
        .from('activities')
        .delete()
        .eq('id', activityId)
      
      if (error) throw error
    }
  }
}

/**
 * Authentication helper functions
 */
export const auth = {
  async signUp(email: string, password: string, metadata?: { full_name?: string }) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata
      }
    })
    
    if (error) throw error
    return data
  },
  
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    
    if (error) throw error
    return data
  },
  
  async signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },
  
  async getSession() {
    const { data: { session }, error } = await supabase.auth.getSession()
    if (error) throw error
    return session
  },
  
  async getUser() {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) throw error
    return user
  }
}