import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Log environment variables for debugging (remove in production)
console.log('Supabase URL:', supabaseUrl)
console.log('Supabase Key present:', !!supabaseAnonKey)

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Supabase credentials missing! Check Vercel environment variables.')
  throw new Error('Supabase credentials not configured')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
