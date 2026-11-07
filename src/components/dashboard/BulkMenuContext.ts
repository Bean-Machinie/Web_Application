import { createContext } from "react"
import type { EntrySelection } from "@/hooks/use-entry-selection"
import type { MemberAction } from "./MemberMenu"

// What a right-click does on an entry that is part of the picked ones: the actions on all of them,
// the same as the bar at the foot of the page offers. Null where nothing can be picked.
export type BulkMenu = { selection: EntrySelection; actions: MemberAction[] }

export const BulkMenuContext = createContext<BulkMenu | null>(null)
