import { useCallback } from "react"
import { File, FileText } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { useMentionEntries } from "@/hooks/use-mention-entries"
import type { JournalNode } from "@/lib/journal"
import type { Tab } from "@/lib/journal-workspace"
import { WORLD_KINDS } from "@/lib/world-kinds"
import { useMentionScope } from "./useMentionScope"

export type TabLabel = { title: string; icon: LucideIcon }

// What a tab is called and drawn as: a page by its title in the tree, an entry by
// its name and kind. Until they are known, a plain placeholder.
export function useJournalTabLabels(nodes: JournalNode[] | null) {
  const entries = useMentionEntries(useMentionScope())

  return useCallback(
    (tab: Tab): TabLabel => {
      if (tab.kind === "page") {
        return { title: nodes?.find((node) => node.id === tab.id)?.title || "Untitled", icon: FileText }
      }
      const entry = entries?.find((candidate) => candidate.id === tab.id)
      return entry ? { title: entry.name, icon: WORLD_KINDS[entry.kind].icon } : { title: "Entry", icon: File }
    },
    [nodes, entries]
  )
}
