import { useCallback, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { fetchOwnUsername } from '@/lib/username'
import { AuthContext } from './AuthContext'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  // Tagged with whose it is, so a stale name is never shown for the next person.
  const [profile, setProfile] = useState<{ userId: string; username: string }>()
  const userId = session?.user.id
  const mine = profile?.userId === userId ? profile : undefined

  const refreshUsername = useCallback(async () => {
    if (userId) setProfile({ userId, username: await fetchOwnUsername(userId) })
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
    refreshUsername().catch(() => userId && setProfile({ userId, username: '' }))
  }, [refreshUsername, userId])

  return (
    <AuthContext.Provider value={{
        session,
        loading,
        username: mine?.username ?? '',
        profileReady: !!mine,
        refreshUsername,
      }}>
      {children}
    </AuthContext.Provider>
  )
}
