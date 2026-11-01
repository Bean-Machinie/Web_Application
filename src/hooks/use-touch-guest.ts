import { useEffect, useRef } from "react"
import { useAuth } from "@/auth/useAuth"
import { supabase } from "@/lib/supabase"

// Tells the database a guest is still here, once per app load, so guests who have gone for
// 30 days can be cleared out. The database takes at most one update a day.
export function useTouchGuest() {
  const { isGuest } = useAuth()
  const touched = useRef(false)

  useEffect(() => {
    if (!isGuest || touched.current) return
    touched.current = true
    void supabase.rpc("touch_guest")
  }, [isGuest])
}
