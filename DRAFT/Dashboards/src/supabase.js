import { createClient } from '@supabase/supabase-js';

// export const supabase = createClient(
//   process.env.REACT_APP_SUPABASE_URL,
//   process.env.REACT_APP_SUPABASE_ANON_KEY
// );

const supabaseUrl = 'https://iinwzibplknjqmofevpw.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlpbnd6aWJwbGtuanFtb2ZldnB3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAxMjgxODEsImV4cCI6MjA4NTcwNDE4MX0.6EJzg0Tbt4feUic5kGgP9Alnhtty2yuDZ7B47OZCeIA'

// export const supabase = createClient(supabaseUrl, supabaseKey)

// // Update this part:
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    // persistSession: false, 
    persistSession: true,
    autoRefreshToken: true,
    storage: localStorage,
  }
})