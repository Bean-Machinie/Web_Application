import { useCallback, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { EMPTY_PROFILE, fetchOwnProfile } from '@/lib/profile'
import type { OwnProfile } from '@/lib/profile'
import { supabase } from '@/lib/supabase'
import { AuthContext } from './AuthContext'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  // Tagged with whose it is, so a stale profile is never shown for the next person.
  const [loaded, setLoaded] = useState<{ userId: string; profile: OwnProfile }>()
  const userId = session?.user.id
  const mine = loaded?.userId === userId ? loaded : undefined

  const refreshProfile = useCallback(async () => {
    if (userId) setLoaded({ userId, profile: await fetchOwnProfile(userId) })
  }, [userId])

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, next) => setSession(next))

    return () => subscription.unsubscribe()
  }, [])

  // Outside onAuthStateChange, where awaiting a Supabase call can deadlock.
  useEffect(() => {
    // A failed lookup still counts as done, so the app is not held up.
    refreshProfile().catch(() => userId && setLoaded({ userId, profile: EMPTY_PROFILE }))
  }, [refreshProfile, userId])

  return (
    <AuthContext.Provider
      value={{
        session,
        loading,
        profile: mine?.profile ?? EMPTY_PROFILE,
        profileReady: !!mine,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
