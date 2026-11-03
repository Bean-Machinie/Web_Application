import { useRef, useState } from "react"
import { useReducedMotion } from "@/hooks/use-reduced-motion"
import { useRollPresenter } from "@/hooks/use-roll-presenter"
import { acquireDiceBox, DICE_SLOTS } from "@/lib/dice-box"
import type { HeldBox } from "@/lib/dice-box"
import { rollDice, throwNotation } from "@/lib/dice"
import type { D20Mode, Sides } from "@/lib/dice"

const FADE_MS = 500
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

// The result is drawn first; the 3D dice are only told where to land. Every roll has a layer of its
// own and plays through on its own, so rolls can follow one another without cutting each other short;
// their results are shown one after another by the presenter.
export function useDiceRoller() {
  const reducedMotion = useReducedMotion()
  // Rolls still playing. A click past the number of layers is ignored, so spamming cannot pile up rolls.
  const active = useRef(0)
  const [layers, setLayers] = useState<boolean[]>([])
  const { history, shown, present, replay, dismiss, clear } = useRollPresenter()

  const setLayer = (slot: number, on: boolean) =>
    setLayers((current) => Object.assign([], current, { [slot]: on }))

  async function roll(sides: Sides, modifier: number, mode: D20Mode) {
    if (active.current >= DICE_SLOTS) return
    active.current++
    const result = rollDice(sides, modifier, mode)

    let held: HeldBox | undefined
    if (!reducedMotion) {
      try {
        held = await acquireDiceBox()
        setLayer(held.slot, true)
        await held.box.roll(throwNotation(result))
      } catch {
        // The engine could not start; the result is still shown below.
      }
    }

    // The dice stay on the table until their result leaves the screen.
    await present(result)
    if (held) setLayer(held.slot, false)
    await wait(FADE_MS)
    held?.box.clearDice()
    held?.release()
    active.current--
  }

  return { history, layers, shown, dismiss, replay, roll, clear }
}
