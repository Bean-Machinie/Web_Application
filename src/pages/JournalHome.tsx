import { useOutletContext } from "react-router-dom"
import { JournalEmpty } from "@/components/dashboard/JournalEmpty"
import type { JournalContext } from "@/components/dashboard/journal-context"

// What the journal shows before a page is chosen.
export function JournalHome() {
  const { tree, canManage } = useOutletContext<JournalContext>()

  return <JournalEmpty canManage={canManage} hasPages={(tree.nodes?.length ?? 0) > 0} />
}
