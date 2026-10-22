import { useState } from "react"
import { FileText, Map as MapIcon } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { findSection } from "@/lib/library-sections"
import { WORLD_KINDS } from "@/lib/world-kinds"
import type { WorldEntryKind } from "@/lib/world-kinds"
import { NewEntryDialog } from "./NewEntryDialog"
import { NewLibraryMapDialog } from "./NewLibraryMapDialog"

const TILE =
  "bg-card hover:bg-accent/50 focus-visible:ring-ring flex w-full items-center gap-4 rounded-lg border p-4 text-left outline-none transition-colors focus-visible:ring-2"

function Tile({ icon: Icon, title, text }: { icon: LucideIcon; title: string; text: string }) {
  return (
    <>
      <span className="bg-muted text-foreground flex size-12 shrink-0 items-center justify-center rounded-lg">
        <Icon className="size-6" />
      </span>
      <span className="flex min-w-0 flex-col gap-0.5">
        <span className="font-medium">{title}</span>
        <span className="text-muted-foreground truncate text-sm">{text}</span>
      </span>
    </>
  )
}

// The row of things to make, at the top of Home. Both make them in your library: a
// map opens the map builder on it straight away; an entry asks for its kind, then its name.
export function HomeCreateTiles({ reload }: { reload: () => Promise<unknown> }) {
  const [makingMap, setMakingMap] = useState(false)
  const [creating, setCreating] = useState<WorldEntryKind | null>(null)

  return (
    <>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <button type="button" className={TILE} onClick={() => setMakingMap(true)}>
          <Tile icon={MapIcon} title="New map" text="Draw one in the map builder" />
        </button>
        <DropdownMenu>
          <DropdownMenuTrigger className={TILE}>
            <Tile icon={FileText} title="New entry" text="A character, place, item and more" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {findSection("world").makes.map((kind) => {
              const { label, icon: KindIcon } = WORLD_KINDS[kind]
              return (
                <DropdownMenuItem key={kind} onSelect={() => setCreating(kind)}>
                  <KindIcon />
                  {label}
                </DropdownMenuItem>
              )
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <NewLibraryMapDialog open={makingMap} onClose={() => setMakingMap(false)} />
      <NewEntryDialog kind={creating} reload={reload} onClose={() => setCreating(null)} />
    </>
  )
}
