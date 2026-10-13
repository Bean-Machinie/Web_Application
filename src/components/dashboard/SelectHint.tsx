import { useSyncExternalStore } from "react"
import type { ReactElement } from "react"
import { KeyChips } from "@/components/ui/key-chips"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { hintLearned, MODIFIER_KEY, subscribeHint } from "@/lib/selection-hint"

const LINES = {
  // In the lists a plain click opens an entry, so picking needs a key.
  list: [
    { label: "Select", keys: [MODIFIER_KEY, "Click"] },
    { label: "Select a range", keys: ["Shift", "Click"] },
  ],
  // In the dialog a plain click already picks.
  dialog: [
    { label: "Select a range", keys: ["Shift", "Click"] },
    { label: "Select all", keys: [MODIFIER_KEY, "A"] },
  ],
}

type Props = {
  kind: keyof typeof LINES
  align?: "start" | "center"
  children: ReactElement
}

// A small tooltip on an entry that says how to pick several, until the person
// has done it once. It wraps the element it hangs on without adding one.
export function SelectHint({ kind, align = "center", children }: Props) {
  const learned = useSyncExternalStore(subscribeHint, hintLearned)

  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      {!learned && (
        <TooltipContent
          side="bottom"
          align={align}
          sideOffset={8}
          className="min-w-44 flex-col items-stretch gap-1.5"
        >
          {LINES[kind].map(({ label, keys }) => (
            <span key={label} className="flex items-center justify-between gap-4">
              {label}
              <KeyChips keys={keys} />
            </span>
          ))}
        </TooltipContent>
      )}
    </Tooltip>
  )
}
