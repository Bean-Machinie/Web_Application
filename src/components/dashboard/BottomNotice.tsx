import type { ReactNode } from "react"
import { FloatingBar } from "./FloatingBar"

type Props = {
  text: string
  // A button on the right, like the settings bar's.
  action?: ReactNode
}

// The settings' "saved" bar, floating over the foot of the page.
export function BottomNotice({ text, action }: Props) {
  return (
    <FloatingBar>
      <span className="min-w-0 text-sm font-medium text-emerald-600 dark:text-emerald-500">
        {text}
      </span>
      {action}
    </FloatingBar>
  )
}
