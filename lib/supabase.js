// lib/supabase.js - MAKE SURE IT HAS AUTH CONFIG
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://glqrnmfzopwzmiiyvwst.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdscXJubWZ6b3B3em1paXl2d3N0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjczNzMyMDIsImV4cCI6MjA4Mjk0OTIwMn0.XIJMwC1WjMph54TRaMO_CDsRvRSTQU2s3HXhiqN_bbU' 

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true, // Keeps user logged in
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
})
