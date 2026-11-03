import { useRef, useState } from "react"
import type { Roll } from "@/lib/dice"

const HISTORY_SIZE = 50
const HOLD_MS = 2000
const FADE_MS = 400

type Waiting = { roll: Roll; leave: () => void }

// The roll shown over the bottom of the screen, and whether it is on its way in or fading out.
export type ShownTotal = { roll: Roll; visible: boolean }

// Results are shown one at a time, in the order the dice settle: each is held for a moment, fades, and
// the next takes its place. A roll enters the recent rolls as its own result appears, so the two agree.
export function useRollPresenter() {
  const [history, setHistory] = useState<Roll[]>([])
  const [shown, setShown] = useState<ShownTotal | null>(null)
  const queue = useRef<Waiting[]>([])
  const running = useRef(false)
  const endHold = useRef<(() => void) | null>(null)

  // Waits out the hold, or less when the result is dismissed.
  const hold = (ms: number) =>
    new Promise<void>((resolve) => {
      const timer = setTimeout(resolve, ms)
      endHold.current = () => {
        clearTimeout(timer)
        resolve()
      }
    })

  async function run() {
    running.current = true
    for (let next = queue.current.shift(); next; next = queue.current.shift()) {
      const { roll } = next
      setHistory((rolls) => [roll, ...rolls].slice(0, HISTORY_SIZE))
      setShown({ roll, visible: true })
      await hold(HOLD_MS)
      setShown({ roll, visible: false })
      next.leave()
      await hold(FADE_MS)
    }
    setShown(null)
    running.current = false
  }

  // Resolves when the result starts to fade, which is when its dice should go too.
  function present(roll: Roll) {
    const left = new Promise<void>((leave) => queue.current.push({ roll, leave }))
    if (!running.current) void run()
    return left
  }

  // Escape: the result on show and any waiting behind it are let go.
  function dismiss() {
    queue.current.forEach((waiting) => waiting.leave())
    queue.current = []
    endHold.current?.()
  }

  return { history, shown, present, dismiss, clear: () => setHistory([]) }
}
