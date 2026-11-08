import { useEffect, useRef, useState } from "react"

// How long the cards stay laid out once the tile is let go.
const LIE_MS = 2500

// Whether a deck's cards are dealt out: from when the tile is pointed at until a little after it is let
// go, unless it is pointed at again first.
export function useDeckDeal() {
  const [dealt, setDealt] = useState(false)
  const timer = useRef(0)

  useEffect(() => () => window.clearTimeout(timer.current), [])

  const onHot = (hot: boolean) => {
    window.clearTimeout(timer.current)
    if (hot) setDealt(true)
    else timer.current = window.setTimeout(() => setDealt(false), LIE_MS)
  }

  return { dealt, onHot }
}
