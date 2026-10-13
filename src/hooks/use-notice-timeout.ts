import { useEffect, useRef } from "react"

const NOTICE_MS = 6000

// A bar that floats over the page goes away by itself: calls `onTimeout` a few
// seconds after `shown` turns true.
export function useNoticeTimeout(shown: boolean, onTimeout: () => void) {
  const latest = useRef(onTimeout)
  useEffect(() => {
    latest.current = onTimeout
  })

  useEffect(() => {
    if (!shown) return
    const timer = window.setTimeout(() => latest.current(), NOTICE_MS)
    return () => window.clearTimeout(timer)
  }, [shown])
}
