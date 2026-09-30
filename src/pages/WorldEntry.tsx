import { useParams } from "react-router-dom"
import { WorldEntryView } from "@/components/dashboard/WorldEntryView"

export function WorldEntry() {
  const { entryId } = useParams()
  if (!entryId) return null

  return <WorldEntryView key={entryId} entryId={entryId} />
}
