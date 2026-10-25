import type { useCharacter } from "@/hooks/use-character"
import type { Character } from "@/lib/characters"
import type { SheetActions } from "./character-actions"

// What each step of the builder is given.
export type BuilderProps = {
  actions: SheetActions
  sheet: ReturnType<typeof useCharacter>
  character: Character
  userId: string
}
