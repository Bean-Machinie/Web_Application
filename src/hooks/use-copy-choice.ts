import { useState } from "react"
import type { AskCopyChoice, CopyChoice, CopyTarget } from "@/lib/world-copy-flow"
import type { PlanRow } from "@/lib/world-copy-plan"

export type Asking = {
  plan: PlanRow[]
  target: CopyTarget
  resolve: (choice: CopyChoice | null) => void
}

// Lets a copy stop and ask what to do with the pins of the maps in it. `ask` is
// handed to the copy; `dialog` is what CopyWithPinsDialog needs to show the
// question and give the answer back.
export function useCopyChoice() {
  const [asking, setAsking] = useState<Asking | null>(null)

  const ask: AskCopyChoice = (plan, target) =>
    new Promise((resolve) => setAsking({ plan, target, resolve }))

  const dialog = {
    asking,
    onChoose: (choice: CopyChoice | null) => {
      asking?.resolve(choice)
      setAsking(null)
    },
  }

  return { ask, dialog }
}

export type CopyChoiceDialog = ReturnType<typeof useCopyChoice>["dialog"]
