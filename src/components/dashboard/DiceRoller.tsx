import { useEffect, useState } from "react"
import { Dices } from "lucide-react"
import { Button } from "@/components/ui/button"
import { KeyChips } from "@/components/ui/key-chips"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { SegmentedControl } from "@/components/ui/segmented-control"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useDiceRoller } from "@/hooks/use-dice-roller"
import { isTyping } from "@/lib/entry-selection"
import type { D20Mode } from "@/lib/dice"
import { DiceHistory } from "./DiceHistory"
import { DiceModifier } from "./DiceModifier"
import { DiceOverlay } from "./DiceOverlay"
import { DiceTray } from "./DiceTray"

const MODES: { value: D20Mode; label: string }[] = [
  { value: "normal", label: "Normal" },
  { value: "advantage", label: "Advantage" },
  { value: "disadvantage", label: "Disadvantage" },
]

// A dice roller in the header. The panel stays open while the dice roll; the history lives only
// as long as the page.
export function DiceRoller() {
  const [open, setOpen] = useState(false)
  const [modifier, setModifier] = useState(0)
  const [mode, setMode] = useState<D20Mode>("normal")
  const { history, shown, visible, roll } = useDiceRoller()

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() !== "r" || event.repeat || event.ctrlKey || event.metaKey || event.altKey) return
      if (isTyping(event.target)) return
      setOpen((current) => !current)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <Tooltip>
          <TooltipTrigger asChild>
            <PopoverTrigger asChild>
              <Button variant="outline" size="icon" aria-label="Roll dice">
                <Dices />
              </Button>
            </PopoverTrigger>
          </TooltipTrigger>
          <TooltipContent className="flex items-center gap-2">
            Roll dice <KeyChips keys={["R"]} />
          </TooltipContent>
        </Tooltip>
        <PopoverContent align="end" sideOffset={8} className="w-[min(22rem,calc(100vw-2rem))] gap-4 p-4" onOpenAutoFocus={(event) => event.preventDefault()}>
          <h2 className="text-sm font-semibold">Roll dice</h2>
          <DiceTray onRoll={(sides) => roll(sides, modifier, mode)} />
          <DiceModifier value={modifier} onChange={setModifier} />
          <SegmentedControl aria-label="d20 roll mode" value={mode} onValueChange={setMode} options={MODES} />
          <DiceHistory rolls={history} />
        </PopoverContent>
      </Popover>
      <DiceOverlay shown={shown} visible={visible} />
    </>
  )
}
