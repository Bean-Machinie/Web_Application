import { useState } from "react"
import type { AskCopyChoice, CopyTarget } from "@/lib/world-copy-flow"
import type { Plan } from "@/lib/world-copy-plan"

export type Asking = {
  plan: Plan
  target: CopyTarget
  // How many entries were picked.
  picked: number
  resolve: (keep: string[] | null) => void
}

// Lets a copy stop and ask which linked entries to bring along. `ask` is handed
// to the copy; `dialog` is what CopyWithLinksDialog needs to show the question
// and give the answer back.
export function useCopyChoice() {
  const [asking, setAsking] = useState<Asking | null>(null)

  const ask: AskCopyChoice = (plan, target, picked) =>
    new Promise((resolve) => setAsking({ plan, target, picked, resolve }))

  const dialog = {
    asking,
    onChoose: (keep: string[] | null) => {
      asking?.resolve(keep)
      setAsking(null)
    },
  }

  return { ask, dialog }
}

export type CopyChoiceDialog = ReturnType<typeof useCopyChoice>["dialog"]
