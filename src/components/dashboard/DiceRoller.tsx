import { useEffect, useState } from "react"
import { Settings } from "lucide-react"
import { Dice6Icon } from "@/components/icons/Dice6Icon"
import { IconButton } from "@/components/IconButton"
import { PanelArrow } from "@/components/PanelArrow"
import { Button } from "@/components/ui/button"
import { KeyChips } from "@/components/ui/key-chips"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useDiceRoller } from "@/hooks/use-dice-roller"
import { isTyping } from "@/lib/entry-selection"
import type { D20Mode } from "@/lib/dice"
import { installDiceDev } from "@/lib/dice-dev"
import { DiceDevRow } from "./DiceDevRow"
import { DiceHistory } from "./DiceHistory"
import { DiceOverlay } from "./DiceOverlay"
import { DiceStylePicker } from "./DiceStylePicker"
import { DiceTray } from "./DiceTray"
import { RollResult } from "./RollResult"

// A dice roller in the header. The panel stays open while the dice roll; the history lives only
// as long as the page.
export function DiceRoller() {
  const [open, setOpen] = useState(false)
  const [modifier, setModifier] = useState(0)
  const [mode, setMode] = useState<D20Mode>("normal")
  const { history, layers, shown, dismiss, replay, roll, clear } = useDiceRoller()

  useEffect(() => (import.meta.env.DEV ? installDiceDev(replay) : undefined), [replay])

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
        <PopoverContent align="end" alignOffset={-400} sideOffset={1} arrowPadding={16} className="h-[min(34rem,var(--radix-popover-content-available-height))] w-[22.5rem] p-0" onOpenAutoFocus={(event) => event.preventDefault()}>
          <PanelArrow />
          <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden rounded-[inherit] p-4">
          <header className="-mx-4 flex items-baseline justify-between gap-3 border-b px-4 pb-3">
            <h2 className="text-sm font-semibold">Roll dice</h2>
            <Popover>
              <Tooltip>
                <TooltipTrigger asChild>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="icon-sm" aria-label="Dice style" className="-my-1 -mr-1.5">
                      <Settings />
                    </Button>
                  </PopoverTrigger>
                </TooltipTrigger>
                <TooltipContent>Dice style</TooltipContent>
              </Tooltip>
              <PopoverContent align="end" className="w-auto gap-3 p-3">
                <h3 className="text-sm font-semibold">Dice style</h3>
                <DiceStylePicker className="max-w-48" />
              </PopoverContent>
            </Popover>
          </header>
          <DiceTray modifier={modifier} onModifier={setModifier} mode={mode} onMode={setMode} onRoll={(sides) => roll(sides, modifier, mode)} />
          <DiceHistory rolls={history} onClear={clear} />
          {import.meta.env.DEV && <DiceDevRow onReplay={replay} />}
          </div>
        </PopoverContent>
      </Popover>
      <DiceOverlay layers={layers} />
      <RollResult shown={shown} onDismiss={dismiss} />
    </>
  )
}
