import { useCallback, useEffect, useRef, useState } from "react"

// How long after the last one closes the group still counts as busy: a list hands the
// focus back to the text only once it has faded out.
const SETTLE_MS = 300

// Which one of a group of menus is open, if any. Moving from one to another is a single
// step, so there is no moment with none open for the group's host to react to.
export function useExclusiveMenu() {
  const [openId, setOpenId] = useState<string | null>(null)
  const [settling, setSettling] = useState(false)
  // Read where state would be a render behind, such as when a menu hands back the focus.
  const current = useRef<string | null>(null)
  const timer = useRef(0)

  const choose = useCallback((next: string | null, from: string) => {
    // A menu already left may still report that it closed.
    if (next === null && current.current !== from) return
    const closing = next === null && current.current !== null
    current.current = next
    window.clearTimeout(timer.current)
    // Set in the same step as the close, so that no render sees the group idle.
    setSettling(closing)
    setOpenId(next)
    if (closing) timer.current = window.setTimeout(() => setSettling(false), SETTLE_MS)
  }, [])

  const closeAll = useCallback(() => {
    window.clearTimeout(timer.current)
    current.current = null
    setSettling(false)
    setOpenId(null)
  }, [])

  useEffect(() => () => window.clearTimeout(timer.current), [])

  return { openId, busy: openId !== null || settling, choose, closeAll, isOpen: () => current.current !== null }
}
