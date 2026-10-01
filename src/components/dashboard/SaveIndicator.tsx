import { AlertCircle, Check, Loader2 } from "lucide-react"
import type { SaveState } from "@/hooks/use-world-fields"

const STATES = {
  saving: { icon: Loader2, text: "Saving…", spin: true },
  saved: { icon: Check, text: "Saved", spin: false },
  error: { icon: AlertCircle, text: "Couldn't save", spin: false },
} as const

export function SaveIndicator({ state }: { state: SaveState }) {
  const shown = state === "idle" ? null : STATES[state]

  return (
    <span
      role="status"
      className={`flex h-5 items-center gap-1.5 text-xs ${
        state === "error" ? "text-destructive" : "text-muted-foreground"
      }`}
    >
      {shown && (
        <>
          <shown.icon className={`size-3.5 ${shown.spin ? "animate-spin" : ""}`} />
          {shown.text}
        </>
      )}
    </span>
  )
}
