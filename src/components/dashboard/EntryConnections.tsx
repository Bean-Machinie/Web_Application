import { useState } from "react"
import { ChevronRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { useEntryConnections } from "@/hooks/use-entry-connections"
import { GROUP_ORDER } from "@/lib/connection-groups"
import type { WorldEntryKind } from "@/lib/world-kinds"
import { ConnectionGroup } from "./ConnectionGroup"

type Props = { entryId: string; kind: WorldEntryKind; name: string; className?: string }

// Everything an entry is connected to, below its content and folded away: what
// it mentions, what mentions it, the maps it is pinned on and, for a map, what is
// pinned on it. Empty groups are left out, and with nothing connected there is
// no section. It reads what the database returns for the viewer and adds nothing
// to it. Opening it asks again, so a mention just written is there.
export function EntryConnections({ entryId, kind, name, className }: Props) {
  const { connections, reload } = useEntryConnections(entryId, kind)
  const [open, setOpen] = useState(false)

  if (!connections || connections.total === 0) return null

  return (
    <Collapsible
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (next) reload()
      }}
      className={className}
    >
      <CollapsibleTrigger asChild>
        <button
          type="button"
          className="group focus-visible:ring-ring -mx-1 flex items-center gap-2 rounded-md px-1 py-1 text-sm font-medium outline-none focus-visible:ring-2"
        >
          <ChevronRight className="text-muted-foreground size-4 transition-transform group-data-[state=open]:rotate-90" />
          Connections
          <Badge variant="secondary">{connections.total}</Badge>
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent className="grid gap-4 pt-3 motion-safe:animate-in motion-safe:fade-in">
        {GROUP_ORDER.filter((key) => connections.groups[key].length > 0).map((key) => (
          <ConnectionGroup
            key={key}
            group={key}
            rows={connections.groups[key]}
            from={{ id: entryId, name }}
          />
        ))}
      </CollapsibleContent>
    </Collapsible>
  )
}
