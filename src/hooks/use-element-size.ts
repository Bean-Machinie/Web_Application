import { useEffect, useRef, useState } from "react"

// The size of an element, kept up to date as it changes.
export function useElementSize<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  const [size, setSize] = useState({ width: 0, height: 0 })

  useEffect(() => {
    const element = ref.current
    if (!element) return
    const watch = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      setSize({ width: Math.round(width), height: Math.round(height) })
    })
    watch.observe(element)
    return () => watch.disconnect()
  }, [])

  return { ref, size }
}
