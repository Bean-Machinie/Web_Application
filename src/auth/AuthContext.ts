import { createContext } from 'react'
import type { Session } from '@supabase/supabase-js'

export type AuthState = {
  session: Session | null
  loading: boolean
  // From the profiles table; empty until loaded, or when none is set.
  username: string
  // False until the name has been looked up, so screens can wait for it.
  profileReady: boolean
  refreshUsername: () => Promise<void>
}

export const AuthContext = createContext<AuthState>({
  session: null,
  loading: true,
  username: "",
  profileReady: false,
  refreshUsername: async () => {},
})
