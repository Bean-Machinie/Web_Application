import type { JournalTreeState } from "@/hooks/use-journal-tree"

// What the journal's layout hands to the page beside its tree.
export type JournalContext = { tree: JournalTreeState; canManage: boolean }
