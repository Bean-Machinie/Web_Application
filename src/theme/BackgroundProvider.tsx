import { useCallback, useMemo, useState } from "react"
import type { ReactNode } from "react"
import { storage } from "@/lib/browser-storage"
import { BackgroundContext, type Background } from "./BackgroundContext"

const STORAGE_KEY = "background"

function readStoredBackground(): Background {
  const stored = storage.getItem(STORAGE_KEY)
  return stored === "still" || stored === "off" ? stored : "animated"
}

// Like the theme: remembered in this browser, and applied as soon as it is picked.
export function BackgroundProvider({ children }: { children: ReactNode }) {
  const [background, setBackgroundState] = useState<Background>(readStoredBackground)

  const setBackground = useCallback((next: Background) => {
    storage.setItem(STORAGE_KEY, next)
    setBackgroundState(next)
  }, [])

  const value = useMemo(() => ({ background, setBackground }), [background, setBackground])

  return <BackgroundContext.Provider value={value}>{children}</BackgroundContext.Provider>
}
