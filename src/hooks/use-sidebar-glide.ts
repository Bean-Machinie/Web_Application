import { useLayoutEffect, useRef, useState } from "react"
import type { RefObject } from "react"
import { useSidebar } from "@/components/ui/sidebar"

// Longer than the sidebar's easing, which is 200ms.
const GLIDE_MS = 260

// A length from the sidebar's own variables ("18rem", "64px") in pixels.
function pixels(value: string) {
  const number = parseFloat(value)
  return value.trim().endsWith("rem") ? number * parseFloat(getComputedStyle(document.documentElement).fontSize) : number
}

// For a page that is costly to lay out, such as one of text: the width to keep it at
// while the sidebar eases open or shut, or null when it is not moving. The page is
// laid out once, at the width it will end up at, and the box around it, which only
// clips, follows the sidebar frame by frame. Laying out at every width in between is
// what makes the slide stutter.
export function useSidebarGlide(box: RefObject<HTMLElement | null>) {
  const { state } = useSidebar()
  const [width, setWidth] = useState<number | null>(null)
  const seen = useRef(state)
  // Where the page is going, so a second toggle in mid-slide counts from there.
  const target = useRef<number | null>(null)
  const timer = useRef(0)

  useLayoutEffect(() => {
    if (seen.current === state) return
    seen.current = state
    const element = box.current
    const wrapper = document.querySelector<HTMLElement>('[data-slot="sidebar-wrapper"]')
    if (!element || !wrapper) return

    const style = getComputedStyle(wrapper)
    const room = pixels(style.getPropertyValue("--sidebar-width")) - pixels(style.getPropertyValue("--sidebar-width-icon"))
    const now = target.current ?? element.getBoundingClientRect().width
    const next = now + (state === "collapsed" ? room : -room)
    target.current = next
    setWidth(next)

    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => {
      target.current = null
      setWidth(null)
    }, GLIDE_MS)
  }, [state, box])

  return width
}
