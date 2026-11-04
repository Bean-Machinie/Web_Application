import { useMemo } from "react"
import { useMentionEntries } from "@/hooks/use-mention-entries"
import type { JournalNode } from "@/lib/journal"
import type { TabContext } from "./journal-tab-kinds"
import { useMentionScope } from "./useMentionScope"

// What the kinds of tab read the campaign by: its pages, and the entries of its world.
export function useJournalTabContext(campaignId: string, nodes: JournalNode[] | null): TabContext {
  const entries = useMentionEntries(useMentionScope())
  return useMemo(() => ({ campaignId, nodes, entries }), [campaignId, nodes, entries])
}
