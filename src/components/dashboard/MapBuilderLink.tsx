import { HammerIcon } from "@/components/icons/HammerIcon"
import { HoverIcon } from "@/components/icons/HoverIcon"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { useWorldScope } from "./useWorldScope"

// Opens a built map in the map builder.
export function MapBuilderLink({ mapId }: { mapId: string }) {
  const { basePath } = useWorldScope()

  return (
    <Button asChild variant="outline" className="w-fit">
      <Link to={`${basePath}/${mapId}/build`} state={{ fromMap: true }}>
        <HoverIcon icon={HammerIcon} />
        Edit map
      </Link>
    </Button>
  )
}
