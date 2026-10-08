import type { ReactNode } from "react"
import { MAP_INPUT_TYPES } from "@/lib/resize-map-image"
import { cn } from "@/lib/utils"

type Props = {
  busy: boolean
  onPick: (file: File) => void
  className?: string
  children: ReactNode
}

// A click or drop target that picks an image file. Style it through
// className; the file input itself is hidden but stays reachable by keyboard.
export function MapImageInput({ busy, onPick, className, children }: Props) {
  return (
    <label
      className={cn(
        "focus-within:ring-ring cursor-pointer focus-within:ring-2",
        busy && "pointer-events-none opacity-60",
        className
      )}
      onDragOver={(event) => event.preventDefault()}
      onDrop={(event) => {
        event.preventDefault()
        const file = event.dataTransfer.files[0]
        if (file) onPick(file)
      }}
    >
      {children}
      <input
        type="file"
        accept={MAP_INPUT_TYPES}
        disabled={busy}
        className="sr-only"
        onChange={(event) => {
          const file = event.target.files?.[0]
          if (file) onPick(file)
          event.target.value = ""
        }}
      />
    </label>
  )
}
