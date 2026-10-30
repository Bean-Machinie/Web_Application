import { Navigate, useParams, useSearchParams } from "react-router-dom"
import { characterStartPath } from "@/lib/characters"

// The panel of the builder that each step of the old one becomes. The class and background
// steps are the sentence, and "choices" has no single pick, so they open none.
const PICK_OF_STEP: Record<string, string> = { species: "size", abilities: "abilities", equipment: "equipment", details: "details" }

// The old detailed builder's address, kept so links to it still work: it opens the quick builder,
// on the panel the step becomes.
export function CharacterBuildRedirect() {
  const { characterId } = useParams()
  const [params] = useSearchParams()
  if (!characterId) return null
  const pick = PICK_OF_STEP[params.get("step") ?? ""]
  return <Navigate to={`${characterStartPath(characterId)}${pick ? `?pick=${pick}` : ""}`} replace />
}
