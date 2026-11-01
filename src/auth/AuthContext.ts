import { createContext } from 'react'
import type { Session } from '@supabase/supabase-js'
import { EMPTY_PROFILE } from '@/lib/profile'
import type { OwnProfile } from '@/lib/profile'

export type AuthState = {
  session: Session | null
  loading: boolean
  // Using Heliosyn through an anonymous sign-in, with no account yet.
  isGuest: boolean
  // From the profiles table; empty until loaded.
  profile: OwnProfile
  // False until the profile has been looked up, so screens can wait for it.
  profileReady: boolean
  refreshProfile: () => Promise<void>
}

export const AuthContext = createContext<AuthState>({
  session: null,
  loading: true,
  isGuest: false,
  profile: EMPTY_PROFILE,
  profileReady: false,
  refreshProfile: async () => {},
})
