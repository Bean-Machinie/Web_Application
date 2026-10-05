import { Hammer } from "lucide-react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"

// Opens a built map in the map builder.
export function MapBuilderLink({ mapId }: { mapId: string }) {
  return (
    <Button asChild variant="outline" className="w-fit">
      <Link to={`/app/world/${mapId}/build`}>
        <Hammer />
        Edit map
      </Link>
    </Button>
  )
}
