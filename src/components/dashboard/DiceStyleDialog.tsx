import { useRef } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useDiceStyle } from "@/hooks/use-dice-style"
import { useStylePreview } from "@/hooks/use-style-preview"
import { ALL_DICE_STYLES, CLASSIC_STYLES, CRAFTED_STYLES } from "@/lib/dice-styles"
import { DiceFelt } from "./DiceFelt"
import { DiceStyleCard } from "./DiceStyleCard"

const SECTIONS = [
  { label: "Classic", styles: CLASSIC_STYLES },
  { label: "Crafted", styles: CRAFTED_STYLES },
]

// Mounted only while the dialog is open, so the 3D dice and their renderer exist only then.
function StyleGrid() {
  const [current, setStyle] = useDiceStyle()
  const host = useRef<HTMLDivElement>(null)
  const areas = useRef<Record<string, HTMLElement | null>>({})
  const preview = useStylePreview(host, areas, ALL_DICE_STYLES)

  return (
    <div className="relative grid gap-4 p-3">
      {/* The same grain and faint glow as behind the panel's dice. */}
      <DiceFelt />
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(closest-side,rgb(255_255_255/0.04),transparent)]" />
      {SECTIONS.map(({ label, styles }) => (
        <div key={label} className="grid gap-2">
          <p className="text-muted-foreground relative text-xs font-medium">{label}</p>
          <div role="radiogroup" aria-label={`${label} dice`} className="grid grid-cols-3 gap-2 sm:grid-cols-6">
            {styles.map((style) => (
              <DiceStyleCard
                key={style.id}
                style={style}
                selected={style.id === current.id}
                loading={preview.state === "loading"}
                area={(element) => {
                  areas.current[style.id] = element
                }}
                onSelect={() => setStyle(style)}
                onHover={(hovered) => preview.hover(hovered ? style.id : null)}
              />
            ))}
          </div>
        </div>
      ))}
      {/* Covers the grid, with the padding as room for a die that grows; out of the way of the pointer. */}
      <div ref={host} aria-hidden className="pointer-events-none absolute inset-0 [&_canvas]:block" />
    </div>
  )
}

type Props = { open: boolean; onOpenChange: (open: boolean) => void }

// The one place the dice style is chosen, from the Roll dice panel and from Settings. A choice applies at once.
export function DiceStyleDialog({ open, onOpenChange }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl" aria-describedby={undefined}>
        <DialogHeader className="-mx-4 border-b px-4 pb-3">
          <DialogTitle className="text-sm font-semibold">Dice style</DialogTitle>
        </DialogHeader>
        <StyleGrid />
        <DialogFooter className="bg-muted/40">
          <Button onClick={() => onOpenChange(false)}>Done</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
