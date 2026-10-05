import { useParams } from "react-router-dom"
import { MapBuilderView } from "@/components/dashboard/MapBuilderView"

export function MapBuild() {
  const { entryId } = useParams()
  if (!entryId) return null

  return <MapBuilderView key={entryId} entryId={entryId} />
}
