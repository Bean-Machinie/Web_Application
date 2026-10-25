import { useParams } from "react-router-dom"
import { CharacterBuilderPage } from "@/components/dashboard/CharacterBuilderPage"

export function CharacterBuilderRoute() {
  const { characterId } = useParams()
  if (!characterId) return null

  return <CharacterBuilderPage key={characterId} id={characterId} />
}
