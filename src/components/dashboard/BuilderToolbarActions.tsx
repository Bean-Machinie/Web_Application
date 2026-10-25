import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import type { SaveState } from "@/hooks/use-world-fields"
import { SaveIndicator } from "./SaveIndicator"

type Props = { saveState: SaveState; error: string | null; last: boolean; onBack?: () => void; onNext: () => void }

// The right end of the builder's toolbar: the save state and the way out, then Back and Continue.
// Every choice is saved as it is made, so with nothing in flight it still reads "Saved".
export function BuilderToolbarActions({ saveState, error, last, onBack, onNext }: Props) {
  const navigate = useNavigate()
  return (
    <>
      {error && <span className="text-destructive max-w-xs truncate text-sm">{error}</span>}
      {/* A fixed width, so "Saving…" turning into "Saved" never moves the buttons beside it. */}
      <div className="flex w-28 shrink-0 justify-end">
        <SaveIndicator state={saveState === "idle" ? "saved" : saveState} />
      </div>
      <Button variant="outline" onClick={() => navigate("/app/library?section=characters")}>Save and exit</Button>
      <Button variant="ghost" disabled={!onBack} onClick={onBack}>Back</Button>
      <Button onClick={onNext}>{last ? "Finish" : "Continue"}</Button>
    </>
  )
}
