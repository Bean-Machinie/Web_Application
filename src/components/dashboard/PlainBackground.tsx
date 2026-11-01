import { usePlainBackground } from "./plain-background"

// Renders nothing; while it is shown, the page has the plain background.
export function PlainBackground() {
  usePlainBackground()
  return null
}
