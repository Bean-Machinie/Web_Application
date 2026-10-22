import { Link } from "react-router-dom"
import { ArrowRight, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { useEntryPreview } from "@/hooks/use-entry-preview"
import type { GraphNode } from "@/lib/world-graph"
import { WORLD_KINDS } from "@/lib/world-kinds"
import { GraphPreviewFacts } from "./GraphPreviewFacts"
import { HiddenBadge } from "./HiddenBadge"
import { KindLabel } from "./KindLabel"
import { useWorldScope } from "./useWorldScope"

type Props = { node: GraphNode; onClose: () => void }

// The selected entry in the corner of the graph: picture, name, kind, a few facts and
// the start of its description, how many entries it is joined to, and the way in.
export function GraphPreviewCard({ node, onClose }: Props) {
  const { basePath, canManage, hasVisibility } = useWorldScope()
  const { entry } = node
  const { icon: KindIcon, tint } = WORLD_KINDS[entry.kind]
  const fields = useEntryPreview(entry.id)
  const hidden = canManage && hasVisibility && !entry.revealed

  return (
    <Card className="absolute bottom-3 left-3 z-10 w-72 max-w-[calc(100%-1.5rem)] gap-2.5 py-3 shadow-lg">
      <CardContent className="flex flex-col gap-2.5 px-3">
        <div className="flex h-12 items-center gap-3">
          <div
            style={{ borderColor: hidden ? undefined : tint }}
            className="bg-muted text-muted-foreground flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-lg border-2 data-[hidden=true]:border-dashed"
            data-hidden={hidden}
          >
            {entry.imageUrl ? (
              <img src={entry.imageUrl} alt="" className="size-full object-cover" />
            ) : (
              <KindIcon className="size-5" />
            )}
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
            <p className="truncate leading-none font-medium">{entry.name}</p>
            <div className="flex items-center gap-1.5">
              <KindLabel kind={entry.kind} />
              {hidden && <HiddenBadge />}
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon-xs"
            className="text-muted-foreground self-start"
            aria-label="Clear selection"
            onClick={onClose}
          >
            <X />
          </Button>
        </div>
        <GraphPreviewFacts kind={entry.kind} fields={fields} canManage={canManage} />
      </CardContent>
      <CardFooter className="items-center gap-3 px-3">
        <span className="text-muted-foreground text-xs">
          {node.degree === 1 ? "1 connection" : `${node.degree} connections`}
        </span>
        <Button asChild size="sm" className="ml-auto">
          <Link to={`${basePath}/${entry.id}`}>
            Open
            <ArrowRight />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
