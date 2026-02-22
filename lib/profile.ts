// Local profile utilities (replaces Supabase)
import { localStorageUtils, User } from './local-storage';

export interface Profile {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  bio: string | null;
  avatar_url: string | null;
  role: 'student' | 'professional' | null;
  skills_to_teach: string[];
  isProfileComplete: boolean;
}

export interface FetchProfileResult {
  profile: Profile | null;
  error: string | null;
}

export interface ProfileUpdateResult {
  error: string | null;
}

/**
 * Fetch current user's profile from local auth context
 */
export async function fetchProfile(): Promise<FetchProfileResult> {
  try {
    const session = localStorageUtils.getSession();

    if (!session) {
      return { profile: null, error: 'Not authenticated.' };
    }

    const profile: Profile = {
      id: session.id,
      email: session.email,
      firstName: session.profile?.firstName || null,
      lastName: session.profile?.lastName || null,
      bio: session.profile?.bio || null,
      avatar_url: session.profile?.avatar_url || null,
      role: session.profile?.role || null,
      skills_to_teach: session.profile?.skills_to_teach || [],
      isProfileComplete: session.profile?.isProfileComplete || false,
    };

    return { profile, error: null };
  } catch (error) {
    return { profile: null, error: 'Failed to fetch profile.' };
  }
}

/**
 * Update user's profile in local storage
 */
export async function updateProfile(input: {
  firstName?: string;
  lastName?: string;
  bio?: string;
  skills_to_teach?: string[];
  avatar_url?: string | null;
}): Promise<ProfileUpdateResult> {
  try {
    const session = localStorageUtils.getSession();

    if (!session) {
      return { error: 'Not authenticated. Please log in and try again.' };
    }

    const updates = {
      firstName: input.firstName || session.profile?.firstName,
      lastName: input.lastName || session.profile?.lastName,
      bio: input.bio || session.profile?.bio,
      avatar_url: input.avatar_url || session.profile?.avatar_url,
      skills_to_teach: input.skills_to_teach || session.profile?.skills_to_teach || [],
      isProfileComplete: !!(input.firstName && input.lastName),
    };

    const updated = localStorageUtils.updateUserProfile(session.id, updates);

    if (!updated) {
      return { error: 'Failed to update profile.' };
    }

    return { error: null };
  } catch (error) {
    console.error('[v0] Profile update error:', error);
    return { error: 'Failed to update profile.' };
  }
}
