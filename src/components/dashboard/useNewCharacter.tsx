import { useState } from "react"
import { NewCharacterDialog } from "./NewCharacterDialog"

// Opens the New character dialog. Call `open`, and render `dialog` somewhere on the page.
export function useNewCharacter() {
  const [asking, setAsking] = useState(false)

  return {
    open: () => setAsking(true),
    dialog: <NewCharacterDialog open={asking} onClose={() => setAsking(false)} />,
  }
}
