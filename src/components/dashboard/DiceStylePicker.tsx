import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useDiceStyle } from "@/hooks/use-dice-style"
import { DICE_STYLES } from "@/lib/dice-styles"
import { cn } from "@/lib/utils"

// Round swatches: the body colour with a small dot of the numeral colour, the current one ringed.
export function DiceStylePicker({ className }: { className?: string }) {
  const [current, setStyle] = useDiceStyle()
  return (
    <div role="radiogroup" aria-label="Dice style" className={cn("flex flex-wrap gap-2.5", className)}>
      {DICE_STYLES.map((style) => (
        <Tooltip key={style.id}>
          <TooltipTrigger asChild>
            <button
              type="button"
              role="radio"
              aria-checked={style.id === current.id}
              aria-label={style.label}
              onClick={() => setStyle(style)}
              style={{ backgroundColor: style.background }}
              className={cn(
                "focus-visible:ring-ring relative size-8 rounded-full ring-1 ring-foreground/20 outline-none focus-visible:ring-2",
                style.id === current.id && "ring-foreground ring-2 ring-offset-2 ring-offset-background"
              )}
            >
              <span aria-hidden style={{ backgroundColor: style.foreground }} className="absolute top-1/2 left-1/2 size-2 -translate-1/2 rounded-full" />
            </button>
          </TooltipTrigger>
          <TooltipContent>{style.label}</TooltipContent>
        </Tooltip>
      ))}
    </div>
  )
}
