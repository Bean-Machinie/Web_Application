import { createContext, useContext } from "react"

type TriggerRipple = (x: number, y: number) => void

// Starts a ripple in the dithered background at a point of the window, in CSS pixels. Does nothing
// where there is no moving background (light theme, a still or plain one, or reduced motion).
export const DitherRippleContext = createContext<TriggerRipple>(() => {})

export const useDitherRipple = () => useContext(DitherRippleContext)

// The middle of an element, for a press that has no pointer position, such as one from the keyboard.
export function centreOf(element: Element) {
  const box = element.getBoundingClientRect()
  return [box.left + box.width / 2, box.top + box.height / 2] as const
}
