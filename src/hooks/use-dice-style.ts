import { useSyncExternalStore } from "react"
import { getDiceStyle, setDiceStyle, subscribeDiceStyle } from "@/lib/dice-style-store"

export function useDiceStyle() {
  return [useSyncExternalStore(subscribeDiceStyle, getDiceStyle), setDiceStyle] as const
}
