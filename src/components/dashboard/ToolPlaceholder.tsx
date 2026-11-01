import type { LucideIcon } from "lucide-react"

type Props = { name: string; tagline: string; icon: LucideIcon }

// A tile that holds a tool's place until it exists: the size, radius and border of a tool
// tile, but not a button, so nothing about it reacts.
export function ToolPlaceholder({ name, tagline, icon: PlaceholderIcon }: Props) {
  return (
    <div
      aria-disabled="true"
      className="bg-muted flex aspect-square w-full cursor-default flex-col items-center justify-center gap-1 rounded-lg border p-3 text-center"
    >
      <PlaceholderIcon className="text-muted-foreground mb-2 size-6" />
      <span className="text-muted-foreground text-sm font-medium">{name}</span>
      <span className="text-muted-foreground text-[13px]">{tagline}</span>
    </div>
  )
}
