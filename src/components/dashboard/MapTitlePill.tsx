import { EyeOff } from "lucide-react"
import { MAP_FLOAT_ROW } from "./map-float"

type Props = { name: string; revealed: boolean }

// The map's title, floating at the top left. It is only a label: renaming is
// in the details panel. A hidden map carries a small, quiet chip beside the
// title; a revealed one shows nothing extra.
export function MapTitlePill({ name, revealed }: Props) {
  return (
    <div
      className={`${MAP_FLOAT_ROW} pointer-events-none absolute top-4 left-4 z-[1000] flex max-w-[calc(100%-6.5rem)] items-center gap-2.5 px-4`}
    >
      <h2 className="truncate text-base font-semibold tracking-tight">{name}</h2>
      {!revealed && (
        <span className="bg-muted/70 text-muted-foreground flex shrink-0 items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-medium">
          <EyeOff className="size-3" />
          Hidden
        </span>
      )}
    </div>
  )
}
