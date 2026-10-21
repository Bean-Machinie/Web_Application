import { useState } from "react"
import type { CopyAsker, CopyItem, CopyTarget } from "@/lib/world-copy-flow"
import type { Plan } from "@/lib/world-copy-plan"

type Resolve = (ids: string[] | null) => void

// What a copy is asking right now.
export type Asking =
  | { kind: "links"; plan: Plan; target: CopyTarget; picked: number; resolve: Resolve }
  | { kind: "duplicates"; entries: CopyItem[]; target: CopyTarget; picked: number; resolve: Resolve }

// Lets a copy stop and ask: whether to add another copy of what the target already
// has, and which linked entries to bring along. `ask` is handed to the copy;
// `dialog` is what CopyWithLinksDialog needs to show the question and give the
// answer back.
export function useCopyChoice() {
  const [asking, setAsking] = useState<Asking | null>(null)

  const ask: CopyAsker = {
    links: (plan, target, picked) =>
      new Promise((resolve) => setAsking({ kind: "links", plan, target, picked, resolve })),
    duplicates: (entries, target, picked) =>
      new Promise((resolve) => setAsking({ kind: "duplicates", entries, target, picked, resolve })),
  }

  const dialog = {
    asking,
    onChoose: (ids: string[] | null) => {
      asking?.resolve(ids)
      setAsking(null)
    },
  }

  return { ask, dialog }
}

export type CopyChoiceDialog = ReturnType<typeof useCopyChoice>["dialog"]
