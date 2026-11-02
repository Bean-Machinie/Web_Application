import { useEffect, useState } from "react"
import { Dice6Icon } from "@/components/icons/Dice6Icon"
import { IconButton } from "@/components/IconButton"
import { KeyChips } from "@/components/ui/key-chips"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useDiceRoller } from "@/hooks/use-dice-roller"
import { isTyping } from "@/lib/entry-selection"
import type { D20Mode } from "@/lib/dice"
import { DiceHistory } from "./DiceHistory"
import { DiceOverlay } from "./DiceOverlay"
import { DiceTray } from "./DiceTray"

// A dice roller in the header. The panel stays open while the dice roll; the history lives only
// as long as the page.
export function DiceRoller() {
  const [open, setOpen] = useState(false)
  const [modifier, setModifier] = useState(0)
  const [mode, setMode] = useState<D20Mode>("normal")
  const { history, layers, totals, roll, clear } = useDiceRoller()

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
              <IconButton icon={Dice6Icon} label="Roll dice" />
            </PopoverTrigger>
          </TooltipTrigger>
          <TooltipContent className="flex items-center gap-2">
            Roll dice <KeyChips keys={["R"]} />
          </TooltipContent>
        </Tooltip>
        <PopoverContent align="end" sideOffset={8} className="h-[min(34rem,var(--radix-popover-content-available-height))] w-[22.5rem] gap-4 overflow-hidden p-4" onOpenAutoFocus={(event) => event.preventDefault()}>
          <header className="-mx-4 flex items-baseline justify-between gap-3 border-b px-4 pb-3">
            <h2 className="text-sm font-semibold">Roll dice</h2>
            <KeyChips keys={["R"]} className="opacity-70" />
          </header>
          <DiceTray modifier={modifier} onModifier={setModifier} mode={mode} onMode={setMode} onRoll={(sides) => roll(sides, modifier, mode)} />
          <DiceHistory rolls={history} onClear={clear} />
        </PopoverContent>
      </Popover>
      <DiceOverlay layers={layers} totals={totals} />
    </>
  )
}
