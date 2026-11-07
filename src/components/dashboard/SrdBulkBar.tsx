import { FolderPlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { EntrySelection } from "@/hooks/use-entry-selection"
import { SelectionBar } from "./SelectionBar"

// What can be done to the SRD creatures that are picked: put them into a campaign, all at once.
// The library's entries have their own, longer bar.
export function SrdBulkBar({ selection, onAdd }: { selection: EntrySelection; onAdd: () => void }) {
  if (!selection.active) return null

  return (
    <SelectionBar selection={selection} progress={null}>
      <Button variant="ghost" size="sm" onClick={onAdd}>
        <FolderPlus />
        <span className="max-sm:sr-only">Add to campaign…</span>
      </Button>
    </SelectionBar>
  )
}
