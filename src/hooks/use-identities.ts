import { useCallback, useEffect, useState } from "react"
import type { UserIdentity } from "@supabase/supabase-js"
import { supabase } from "@/lib/supabase"

type Methods = { identities: UserIdentity[]; hasPassword: boolean }

// A password set on a provider account adds no identity, so it is asked of
// the database separately (see has_password).
async function load(): Promise<Methods> {
  const [identities, password] = await Promise.all([
    supabase.auth.getUserIdentities(),
    supabase.rpc("has_password"),
  ])

  return {
    identities: identities.error ? [] : identities.data.identities,
    hasPassword: password.error ? false : Boolean(password.data),
  }
}

// How the signed-in person can log in; undefined until loaded.
export function useIdentities() {
  const [methods, setMethods] = useState<Methods>()

  const reload = useCallback(async () => setMethods(await load()), [])

  useEffect(() => {
    let stale = false
    load().then((found) => !stale && setMethods(found))
    return () => {
      stale = true
    }
  }, [])

  return { ...methods, reload }
}
