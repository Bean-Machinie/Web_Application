import { useEffect, useRef } from "react"
import { ACTIONS } from "@/lib/shortcut-actions"
import type { ActionId } from "@/lib/shortcut-actions"
import { keyOf, matches } from "@/lib/shortcut-keys"
import { getTable } from "@/lib/shortcut-store"

// What an action does. It says false when it has nothing to do just now (nothing
// is selected, say), and the key is then left alone.
export type Handler = (event: KeyboardEvent) => boolean | void
// What a held action does on the way down and on the way up.
export type Hold = { down: Handler; up: Handler }
export type Handlers = Partial<Record<ActionId, Handler | Hold>>

const inGuard = (event: KeyboardEvent, guard: string) =>
  guard !== "" && event.target instanceof Element && event.target.closest(guard) !== null

// The one listener for the builder's keys: finds the action whose key was
// pressed, unless the key is a field's or a dialog's own there (each action says
// where), and does it. The first that is bound to the key and has something to
// do wins.
export function useShortcuts(handlers: Handlers, enabled: boolean) {
  const latest = useRef(handlers)
  useEffect(() => {
    latest.current = handlers
  })

  useEffect(() => {
    if (!enabled) return
    const onKey = (event: KeyboardEvent) => {
      const table = getTable()
      const up = event.type === "keyup"
      for (const action of ACTIONS) {
        const handler = latest.current[action.id]
        if (!handler || inGuard(event, action.guard)) continue
        if (up) {
          // Letting go of a held key does not depend on what else is held.
          if (typeof handler === "function" || !table[action.id].some(({ key }) => key === keyOf(event))) continue
          event.preventDefault()
          handler.up(event)
          return
        }
        if (!table[action.id].some((binding) => matches(binding, event))) continue
        // A held key repeats while it is down; the key is still taken from the page.
        if (typeof handler !== "function" && event.repeat) {
          event.preventDefault()
          return
        }
        const run = typeof handler === "function" ? handler : handler.down
        if (run(event) === false) continue
        event.preventDefault()
        return
      }
    }
    window.addEventListener("keydown", onKey)
    window.addEventListener("keyup", onKey)
    return () => {
      window.removeEventListener("keydown", onKey)
      window.removeEventListener("keyup", onKey)
    }
  }, [enabled])
}
