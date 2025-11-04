import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://tfljmvoitczfugsvfcjz.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRmbGptdm9pdGN6ZnVnc3ZmY2p6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE4OTk3NzYsImV4cCI6MjA3NzQ3NTc3Nn0.HY0SCsGEhOjwU-TX0MHlytHbB-m-D2RfklOxMWE4INs'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
// passord database Markusgj2008060