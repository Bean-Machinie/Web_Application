import { Link } from "react-router-dom"
import { HammerIcon } from "@/components/icons/HammerIcon"
import { HoverIcon } from "@/components/icons/HoverIcon"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MAP_FLOAT } from "./map-float"
import { useWorldScope } from "./useWorldScope"

// Floats over a map that has been built but not published: it says so, and carries on to the
// builder. It is the same surface as everything else floating over a map.
export function MapDraftBar({ mapId }: { mapId: string }) {
  const { basePath } = useWorldScope()

  return (
    <div
      className={`${MAP_FLOAT} absolute top-4 left-1/2 z-[1000] flex h-11 -translate-x-1/2 items-center gap-3 py-1.5 pr-1.5 pl-3`}
    >
      <Badge variant="secondary">Draft</Badge>
      <span className="text-muted-foreground hidden text-xs sm:inline">Not published yet</span>
      <Button asChild size="sm">
        <Link to={`${basePath}/${mapId}/build`} state={{ fromMap: true }}>
          <HoverIcon icon={HammerIcon} />
          Continue editing
        </Link>
      </Button>
    </div>
  )
}
