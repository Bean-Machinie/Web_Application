import { useState } from "react"
import { useAuth } from "@/auth/useAuth"
import { defaultSort } from "@/lib/campaign-list"
import type { RoleFilter, Sort } from "@/lib/campaign-list"

type Prefs = { role: RoleFilter; sort: Sort }

const ROLES = ["all", "gm", "player"]
const SORT_KEYS = ["name", "created"]
const SORT_DIRS = ["asc", "desc"]

const DEFAULTS: Prefs = { role: "all", sort: defaultSort("created") }

// Anything stored that is not a known value falls back to the default.
function parse(text: string | null): Prefs {
  try {
    const saved = JSON.parse(text ?? "null")
    if (ROLES.includes(saved?.role) && SORT_KEYS.includes(saved?.sort?.by) && SORT_DIRS.includes(saved?.sort?.dir)) {
      return saved
    }
  } catch {
    // Unreadable, so start from the defaults.
  }
  return DEFAULTS
}

// The role filter and sort order, remembered per user in this browser.
export function useCampaignListPrefs() {
  const storageKey = `campaigns-list:${useAuth().session!.user.id}`
  const [prefs, setPrefs] = useState<Prefs>(() => {
    try {
      return parse(localStorage.getItem(storageKey))
    } catch {
      return DEFAULTS
    }
  })

  function change(next: Partial<Prefs>) {
    const updated = { ...prefs, ...next }
    setPrefs(updated)
    try {
      localStorage.setItem(storageKey, JSON.stringify(updated))
    } catch {
      // The choice just will not be remembered.
    }
  }

  return {
    role: prefs.role,
    sort: prefs.sort,
    setRole: (role: RoleFilter) => change({ role }),
    setSort: (sort: Sort) => change({ sort }),
  }
}
