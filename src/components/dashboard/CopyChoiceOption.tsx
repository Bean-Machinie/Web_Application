import { cn } from "@/lib/utils"

type Props = {
  selected: boolean
  title: string
  description: string
  onSelect: () => void
}

// One of the answers in the copy dialog: a card that works as a radio button.
export function CopyChoiceOption({ selected, title, description, onSelect }: Props) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className={cn(
        "flex w-full items-start gap-3 rounded-lg border p-3 text-left transition-colors outline-none focus-visible:ring-2 focus-visible:ring-foreground/10",
        selected ? "border-primary bg-primary/5" : "hover:bg-muted/50"
      )}
    >
      <span
        className={cn(
          "mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border",
          selected ? "border-primary" : "border-foreground/30"
        )}
      >
        {selected && <span className="bg-primary size-2 rounded-full" />}
      </span>
      <span className="grid gap-0.5">
        <span className="text-sm font-medium">{title}</span>
        <span className="text-muted-foreground text-[13px] leading-snug">{description}</span>
      </span>
    </button>
  )
}
