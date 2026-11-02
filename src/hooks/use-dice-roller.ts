import { useRef, useState } from "react"
import { useReducedMotion } from "@/hooks/use-reduced-motion"
import { getDiceBox } from "@/lib/dice-box"
import { rollDice, throwNotation } from "@/lib/dice"
import type { D20Mode, Roll, Sides } from "@/lib/dice"

const HISTORY_SIZE = 50
const HOLD_MS = 2000
const FADE_MS = 500
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

// The result is drawn first; the 3D dice are only told where to land. A roll that is still
// showing blocks the next one, so the dice never pile up.
export function useDiceRoller() {
  const reducedMotion = useReducedMotion()
  const busy = useRef(false)
  const [history, setHistory] = useState<Roll[]>([])
  const [shown, setShown] = useState<Roll | null>(null)
  const [visible, setVisible] = useState(false)

  async function roll(sides: Sides, modifier: number, mode: D20Mode) {
    if (busy.current) return
    busy.current = true
    const result = rollDice(sides, modifier, mode)
    let box: Awaited<ReturnType<typeof getDiceBox>> | undefined

    if (!reducedMotion) {
      setVisible(true)
      try {
        box = await getDiceBox()
        await box.roll(throwNotation(result))
      } catch {
        // The engine could not start; the result is still shown below.
      }
    }

    setShown(result)
    setVisible(true)
    setHistory((rolls) => [result, ...rolls].slice(0, HISTORY_SIZE))
    await wait(HOLD_MS)
    setVisible(false)
    await wait(FADE_MS)
    box?.clearDice()
    setShown(null)
    busy.current = false
  }

  return { history, shown, visible, roll, clear: () => setHistory([]) }
}
