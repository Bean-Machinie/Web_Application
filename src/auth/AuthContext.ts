import { createContext } from 'react'
import type { Session } from '@supabase/supabase-js'
import { EMPTY_PROFILE } from '@/lib/profile'
import type { OwnProfile } from '@/lib/profile'

export type AuthState = {
  session: Session | null
  loading: boolean
  // From the profiles table; empty until loaded.
  profile: OwnProfile
  // False until the profile has been looked up, so screens can wait for it.
  profileReady: boolean
  refreshProfile: () => Promise<void>
}

export const AuthContext = createContext<AuthState>({
  session: null,
  loading: true,
  profile: EMPTY_PROFILE,
  profileReady: false,
  refreshProfile: async () => {},
})
