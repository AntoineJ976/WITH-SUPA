import { createClient } from '@supabase/supabase-js'

// Check if Supabase is properly configured
export const isSupabaseConfigured = (): boolean => {
  const url = import.meta.env.VITE_SUPABASE_URL
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
  
  return !!(url && anonKey && url !== 'undefined' && anonKey !== 'undefined' && url.startsWith('https://') && anonKey.length > 0)
}

// Only create Supabase client if properly configured
export const supabase = (() => {
  if (isSupabaseConfigured()) {
    try {
      return createClient(
        import.meta.env.VITE_SUPABASE_URL!,
        import.meta.env.VITE_SUPABASE_ANON_KEY!
      )
    } catch (error) {
      console.warn('Failed to initialize Supabase client:', error)
      return null
    }
  }
  return null
})()
