import { ChevronRight } from "lucide-react"
import { WORLD_KINDS } from "@/lib/world-kinds"
import type { WorldEntryKind } from "@/lib/world-kinds"
import { CreateCard } from "./CreateCard"

type Props = { kinds: WorldEntryKind[]; onPick: (kind: WorldEntryKind) => void }

const BLURB: Partial<Record<WorldEntryKind, string>> = {
  character: "A person in your world",
  creature: "A beast or monster",
  location: "A place",
  item: "An object",
  lore: "History, myths and notes",
}

// One row per kind of entry; clicking makes one at once.
export function CreateEntries({ kinds, onPick }: Props) {
  return (
    <CreateCard title="Entries">
      {kinds.map((kind) => {
        const { label, icon: KindIcon } = WORLD_KINDS[kind]
        return (
          <button
            key={kind}
            type="button"
            onClick={() => onPick(kind)}
            className="hover:bg-accent/50 focus-visible:ring-ring flex items-center gap-3 rounded-md px-2 py-2 text-left outline-none focus-visible:ring-2"
          >
            <span className="bg-muted text-muted-foreground flex size-9 shrink-0 items-center justify-center rounded-lg">
              <KindIcon className="size-4" />
            </span>
            <span className="flex min-w-0 flex-1 flex-col">
              <span className="truncate text-sm font-medium">{label}</span>
              <span className="text-muted-foreground truncate text-xs">{BLURB[kind]}</span>
            </span>
            <ChevronRight className="text-muted-foreground size-4 shrink-0" />
          </button>
        )
      })}
    </CreateCard>
  )
}
