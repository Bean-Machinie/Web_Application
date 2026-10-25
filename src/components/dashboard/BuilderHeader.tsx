import { useNavigate } from "react-router-dom"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { useCharacter } from "@/hooks/use-character"
import type { Character } from "@/lib/characters"
import { EditableName } from "./EditableName"
import { SaveIndicator } from "./SaveIndicator"

type Props = { sheet: ReturnType<typeof useCharacter>; character: Character }

// One line: the name, which renames in place, and the rules, then the save state and the way out.
export function BuilderHeader({ sheet, character }: Props) {
  const navigate = useNavigate()
  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-3">
        <div className="w-52 min-w-0">
          <EditableName name={character.name} small onSave={async (name) => void (await sheet.edit("name", name))} />
        </div>
        <Badge variant="outline">D&amp;D 5e · 2024 rules</Badge>
      </div>
      <div className="flex items-center gap-3">
        {sheet.error && <span className="text-destructive max-w-xs truncate text-sm">{sheet.error}</span>}
        <SaveIndicator state={sheet.saveState === "idle" ? "saved" : sheet.saveState} />
        <Button variant="outline" onClick={() => navigate("/app/library?section=characters")}>Save and exit</Button>
      </div>
    </header>
  )
}
