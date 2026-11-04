import { WorldEntryView } from "./WorldEntryView"
import type { TabContentProps } from "./journal-tab-kinds"

// A world entry in a tab: its page as it is in the World.
export function JournalEntryTab({ id }: TabContentProps) {
  return (
    <div className="flex min-h-full flex-col gap-4 p-4 md:p-6">
      <WorldEntryView key={id} entryId={id} />
    </div>
  )
}
