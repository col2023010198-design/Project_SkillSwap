import { supabase } from '@/lib/supabase'

// ------------------------------------------------------------
// Types
// ------------------------------------------------------------

/** Shape returned by fetchProfile */
export interface Profile {
  id: string
  email: string
  first_name: string | null
  last_name: string | null
  username: string | null
  avatar_url: string | null
  role: 'student' | 'professional' | null
  is_verified: boolean
  connections_count: number
  posts_count: number
  rating: number
  skills_to_teach: string[]
}

export interface FetchProfileResult {
  profile: Profile | null
  error: string | null
}

export interface UpdateProfileInput {
  first_name: string
  last_name: string
  username: string
  skills_to_teach_raw?: string
  avatar_url?: string | null
}

export interface ProfileUpdateResult {
  error: string | null
}

// ------------------------------------------------------------
// Helpers
// ------------------------------------------------------------

/**
 * Converts a comma-separated skills string into a clean string array.
 * e.g. "JavaScript, React,  Node.js" → ["JavaScript", "React", "Node.js"]
 */
function parseSkills(raw: string | undefined): string[] {
  if (!raw || raw.trim() === '') return []
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
}

/**
 * Derives the user's role from their email domain.
 *
 * Recognised academic patterns:
 *   - Ends with .edu          (e.g. user@mit.edu)
 *   - Contains .edu.          (e.g. user@cam.ac.edu.au)
 *   - Ends with .ac.XX        (e.g. user@ox.ac.uk)
 *   - Ends with .edu.XX       (e.g. user@uni.edu.ph)
 *   - Contains common academic keywords in the domain
 *
 * Everything else → 'professional'
 */
function deriveRole(email: string): 'student' | 'professional' {
  const domain = email.split('@')[1]?.toLowerCase() ?? ''

  const academicPatterns = [
    /\.edu$/,           // .edu TLD
    /\.edu\./,          // .edu. in the middle (e.g. .edu.au)
    /\.ac\.[a-z]{2}$/, // .ac.uk, .ac.jp, etc.
    /\.edu\.[a-z]{2}$/, // .edu.ph, .edu.sg, etc.
    /^school\./,
    /university/,
    /college/,
    /institute/,
  ]

  const isAcademic = academicPatterns.some((pattern) => pattern.test(domain))
  return isAcademic ? 'student' : 'professional'
}

// ------------------------------------------------------------
// Core function
// ------------------------------------------------------------

/**
 * Upserts the authenticated user's profile in public.profiles.
 *
 * - Maps form fields → DB columns (snake_case)
 * - Parses comma-separated skill strings → text[]
 * - Derives role from the email domain automatically
 * - Sets updated_at to the current timestamp
 *
 * Usage:
 *   const { error } = await updateProfile({ first_name, last_name, ... })
 */
export async function updateProfile(
  input: UpdateProfileInput
): Promise<ProfileUpdateResult> {
  // 1. Get the current authenticated session
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession()

  if (sessionError || !session) {
    return { error: 'Not authenticated. Please log in and try again.' }
  }

  const userId = session.user.id
  const userEmail = session.user.email ?? ''

  // 2. Derive role from the email domain
  const role = deriveRole(userEmail)

  // 3. Parse raw comma-separated skill strings into arrays
  const skills_to_teach = parseSkills(input.skills_to_teach_raw)

  // 4. Build the payload to upsert
  const payload = {
    id: userId,
    first_name: input.first_name.trim(),
    last_name: input.last_name.trim(),
    username: input.username.trim().toLowerCase(),
    skills_to_teach: skills_to_teach,
    role,
    updated_at: new Date().toISOString(),
    ...(input.avatar_url !== undefined && { avatar_url: input.avatar_url }),
  }

  // 5. Upsert — inserts on first save, updates on subsequent saves
  const { error } = await supabase
    .from('profiles')
    .upsert(payload, { onConflict: 'id' })

  if (error) {
    // Surface a friendly message for the most common constraint violation
    if (error.code === '23505') {
      return { error: 'That username is already taken. Please choose another.' }
    }
    return { error: error.message }
  }

  return { error: null }
}

// ------------------------------------------------------------
// fetchProfile
// ------------------------------------------------------------

/**
 * Fetches the authenticated user's full profile from public.profiles.
 *
 * Retrieves:
 *   - Header data: connections_count, rating, posts_count
 *   - Verification badge: is_verified
 *   - Skill tag arrays: skills_to_teach
 *   - Identity fields: first_name, last_name, username, , avatar_url, role
 *
 * Returns null profile + error string on failure.
 *
 * Usage:
 *   const { profile, error } = await fetchProfile()
 */
export async function fetchProfile(): Promise<FetchProfileResult> {
  // 1. Resolve the current user
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession()

  if (sessionError || !session) {
    return { profile: null, error: 'Not authenticated.' }
  }

  // 2. Select only the columns the UI needs
  const { data, error } = await supabase
    .from('profiles')
    .select(
      `id,
       first_name,
       last_name,
       username,
       avatar_url,
       role,
       is_verified,
       posts_count,
       rating,
       skills_to_teach`
    )
    .eq('id', session.user.id)
    .maybeSingle()

  if (error) {
    return { profile: null, error: error.message }
  }

  // If no profile exists yet, return a message prompting user to create one
  if (!data) {
    return { profile: null, error: 'Profile not found. Please complete your profile setup.' }
  }

  // Add email from auth session (not stored in profiles table)
  const profile: Profile = {
    ...data,
    email: session.user.email ?? '',
  }

  return { profile, error: null }
}
