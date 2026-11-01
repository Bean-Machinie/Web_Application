import { useEffect, useRef, useState } from "react"

// Whether an element has come into view (or is about to), and stays true after.
export function useSeen<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  const [seen, setSeen] = useState(false)

  useEffect(() => {
    const element = ref.current
    if (!element || seen) return
    const watch = new IntersectionObserver(([entry]) => entry.isIntersecting && setSeen(true), {
      rootMargin: "200px",
    })
    watch.observe(element)
    return () => watch.disconnect()
  }, [seen])

  return { ref, seen }
}
