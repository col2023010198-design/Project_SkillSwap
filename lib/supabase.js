import { createClient } from '@supabase/supabase-js'

// Next.js requires the NEXT_PUBLIC_ prefix for variables exposed to the browser.
// Add these to your .env.local file (copy from .env.local.example).
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    'Missing Supabase environment variables.\n' +
    'Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to your .env.local file.'
  )
}

export const supabase = createClient(supabaseUrl, supabaseKey)

export default supabase