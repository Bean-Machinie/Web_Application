import { useCallback, useRef, useState } from "react"

// Which one of a group of menus is open, if any. Moving from one to another is a single
// step, so there is no moment with none open for the group's host to react to.
export function useExclusiveMenu() {
  const [openId, setOpenId] = useState<string | null>(null)
  // Read where state would be a render behind, such as when a menu hands back the focus.
  const current = useRef<string | null>(null)

  const choose = useCallback((next: string | null, from: string) => {
    // A menu already left may still report that it closed.
    if (next === null && current.current !== from) return
    current.current = next
    setOpenId(next)
  }, [])

  const closeAll = useCallback(() => {
    current.current = null
    setOpenId(null)
  }, [])

  return { openId, choose, closeAll, isOpen: () => current.current !== null }
}
