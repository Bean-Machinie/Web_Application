import { createContext } from "react"

// Where a clicked mention should open: beside, in the other pane, or in a new tab of
// this one. Provided by each pane of the journal; absent elsewhere, where a mention
// is a plain link to the entry's page.
export type MentionOpen = (id: string, where: "other" | "tab", kind?: "entry" | "rule") => void

export const MentionOpenContext = createContext<MentionOpen | null>(null)
