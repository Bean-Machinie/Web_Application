import { useRef, useState } from "react"
import { useReducedMotion } from "@/hooks/use-reduced-motion"
import { acquireDiceBox, DICE_SLOTS } from "@/lib/dice-box"
import type { HeldBox } from "@/lib/dice-box"
import { rollDice, throwNotation } from "@/lib/dice"
import type { D20Mode, Roll, Sides } from "@/lib/dice"

const HISTORY_SIZE = 50
const HOLD_MS = 2000
const FADE_MS = 500
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export type ShownTotal = { roll: Roll; visible: boolean }

// The result is drawn first; the 3D dice are only told where to land. Every roll has a layer and a
// total of its own and plays through on its own, so rolls can follow one another without cutting
// each other short.
export function useDiceRoller() {
  const reducedMotion = useReducedMotion()
  // Rolls still playing. A click past the number of layers is ignored, so spamming cannot pile up rolls.
  const active = useRef(0)
  const [history, setHistory] = useState<Roll[]>([])
  const [layers, setLayers] = useState<boolean[]>([])
  const [totals, setTotals] = useState<ShownTotal[]>([])

  const setLayer = (slot: number, on: boolean) =>
    setLayers((current) => Object.assign([], current, { [slot]: on }))
  const setTotal = (roll: Roll, visible: boolean | null) =>
    setTotals((current) =>
      visible === null
        ? current.filter((total) => total.roll.id !== roll.id)
        : [...current.filter((total) => total.roll.id !== roll.id), { roll, visible }]
    )

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

    // The list waits for the dice to land, so it shows the result together with the total.
    setHistory((rolls) => [result, ...rolls].slice(0, HISTORY_SIZE))
    setTotal(result, true)
    await wait(HOLD_MS)
    if (held) setLayer(held.slot, false)
    setTotal(result, false)
    await wait(FADE_MS)
    held?.box.clearDice()
    held?.release()
    setTotal(result, null)
    active.current--
  }

  return { history, layers, totals, roll, clear: () => setHistory([]) }
}
