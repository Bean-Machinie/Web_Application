import { cn } from "cn"

// A key, or the keys of a shortcut, as small chips: "Shift+H" is ["Shift", "H"].
function KeyChips({ keys, className }: { keys: string[]; className?: string }) {
  return (
    <span data-slot="key-chips" className={cn("flex shrink-0 items-center gap-0.5", className)}>
      {keys.map((key, index) => (
        <kbd
          key={`${key}-${index}`}
          className="bg-foreground/10 text-popover-foreground/80 inline-flex h-4 min-w-4 items-center justify-center rounded-sm px-1 text-[10px] leading-none font-medium"
        >
          {key}
        </kbd>
      ))}
    </span>
  )
}

export { KeyChips }
