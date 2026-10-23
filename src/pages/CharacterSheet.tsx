import { useParams } from "react-router-dom"
import { CharacterPage } from "@/components/dashboard/CharacterPage"

export function CharacterSheetPage() {
  const { characterId } = useParams()
  if (!characterId) return null

  return <CharacterPage key={characterId} id={characterId} />
}
