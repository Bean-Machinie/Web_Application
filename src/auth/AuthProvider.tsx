import { useCallback, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { fetchOwnUsername } from '@/lib/username'
import { AuthContext } from './AuthContext'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [username, setUsername] = useState('')
  const userId = session?.user.id

  const refreshUsername = useCallback(async () => {
    setUsername(userId ? await fetchOwnUsername(userId) : '')
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
    refreshUsername().catch(() => {})
  }, [refreshUsername])

  return (
    <AuthContext.Provider value={{ session, loading, username, refreshUsername }}>
      {children}
    </AuthContext.Provider>
  )
}
