import { useParams } from "react-router-dom"
import { QuickBuildPage } from "@/components/dashboard/QuickBuildPage"

export function CharacterStartRoute() {
  const { characterId } = useParams()
  if (!characterId) return null

  return <QuickBuildPage key={characterId} id={characterId} />
}
