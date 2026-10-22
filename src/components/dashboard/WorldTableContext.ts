import { createContext } from "react"
import type { EntrySelection } from "@/hooks/use-entry-selection"
import type { WorldManage } from "./world-manage"

// What the cells of the list's table need besides their own entry, so that the
// column definitions can stay the same from one render to the next.
export type WorldTableValue = {
  manage: WorldManage | null
  selection: EntrySelection | null
  // Null while they load.
  connections: ReadonlyMap<string, number> | null
}

export const WorldTableContext = createContext<WorldTableValue>({
  manage: null,
  selection: null,
  connections: null,
})
