import { useAuth } from "@/auth/useAuth"
import { defaultSort } from "@/lib/campaign-list"
import type { RoleFilter, Sort } from "@/lib/campaign-list"
import { useStoredValue } from "./use-stored-value"

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

const write = (prefs: Prefs) => JSON.stringify(prefs)

// The role filter and sort order, remembered per user in this browser.
export function useCampaignListPrefs() {
  const [prefs, setPrefs] = useStoredValue(`campaigns-list:${useAuth().session!.user.id}`, parse, write)
  const change = (next: Partial<Prefs>) => setPrefs({ ...prefs, ...next })

  return {
    role: prefs.role,
    sort: prefs.sort,
    setRole: (role: RoleFilter) => change({ role }),
    setSort: (sort: Sort) => change({ sort }),
  }
}
