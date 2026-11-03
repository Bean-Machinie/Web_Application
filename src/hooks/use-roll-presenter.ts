import { useRef, useState } from "react"
import { logResult } from "@/lib/dice-dev"
import { faceOf, holdOf, momentOf } from "@/lib/dice-result"
import type { Roll } from "@/lib/dice"

const HISTORY_SIZE = 50
const FADE_MS = 400

type Waiting = { roll: Roll; leave: () => void; replay?: boolean }

// The roll shown over the bottom of the screen, and whether it is on its way in or fading out.
export type ShownTotal = { roll: Roll; visible: boolean }

// Results are shown one at a time, in the order the dice settle: each is held for a moment, fades, and
// the next takes its place. A roll enters the recent rolls as its own result appears, so the two agree.
export function useRollPresenter() {
  const [history, setHistory] = useState<Roll[]>([])
  const [shown, setShown] = useState<ShownTotal | null>(null)
  const queue = useRef<Waiting[]>([])
  const running = useRef(false)
  const last = useRef<Roll | null>(null)
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
      if (!next.replay) {
        last.current = roll
        setHistory((rolls) => [roll, ...rolls].slice(0, HISTORY_SIZE))
      }
      setShown({ roll, visible: true })
      await hold(holdOf(roll))
      setShown({ roll, visible: false })
      next.leave()
      await hold(FADE_MS)
    }
    setShown(null)
    running.current = false
  }

  // Resolves when the result starts to fade, which is when its dice should go too.
  function present(roll: Roll) {
    if (import.meta.env.DEV) logResult(roll, faceOf(roll), momentOf(roll))
    const left = new Promise<void>((leave) => queue.current.push({ roll, leave }))
    if (!running.current) void run()
    return left
  }

  // Development only: the last result's moment again, without a roll and without a new row in the list.
  function replay() {
    if (!last.current) return
    const roll = { ...last.current, id: -Date.now() }
    if (import.meta.env.DEV) logResult(roll, faceOf(roll), momentOf(roll))
    queue.current.push({ roll, leave: () => {}, replay: true })
    if (!running.current) void run()
  }

  // Escape: the result on show and any waiting behind it are let go.
  function dismiss() {
    queue.current.forEach((waiting) => waiting.leave())
    queue.current = []
    endHold.current?.()
  }

  return { history, shown, present, replay, dismiss, clear: () => setHistory([]) }
}
