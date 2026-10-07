import { useEffect, useState } from "react"
import { ACTIONS } from "@/lib/shortcut-actions"
import type { ActionId } from "@/lib/shortcut-actions"
import { bindingFromEvent, refusal, sameBinding } from "@/lib/shortcut-keys"
import type { Binding } from "@/lib/shortcut-keys"
import { getTable, ownerOf, setBindings } from "@/lib/shortcut-store"

// Which key of which action is waiting for a new one. "slot" is its place among
// the action's keys, and one past the last is a key being added.
export type Target = { action: ActionId; slot: number }

// A key that another action has, waiting to be taken over or given up.
export type Conflict = { binding: Binding; owner: ActionId }

const FIXED = new Set(ACTIONS.filter(({ fixed }) => fixed).map(({ id }) => id))
export const isFixed = (id: ActionId) => FIXED.has(id)

// Editing the keys in the shortcuts dialog: pick a key to change, press the new
// one, and if another action has it, say which and ask. While a key is being
// waited for, nothing else hears the keyboard (Escape gives up), and a click
// anywhere else gives up as well. Everything is let go when the dialog closes.
// A key that a fixed action has cannot be taken over, only given up.
export function useShortcutEditor(open: boolean) {
  const [target, setTarget] = useState<Target | null>(null)
  const [conflict, setConflict] = useState<Conflict | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const cancel = () => {
    setTarget(null)
    setConflict(null)
    setMessage(null)
  }

  const start = (action: ActionId, slot: number) => {
    cancel()
    setTarget({ action, slot })
  }

  const put = (at: Target, binding: Binding) => {
    const list = [...getTable()[at.action]]
    list[at.slot] = binding
    setBindings(at.action, list)
    cancel()
  }

  useEffect(() => {
    if (!open) cancel()
  }, [open])

  useEffect(() => {
    if (!target) return
    const onKey = (event: KeyboardEvent) => {
      event.preventDefault()
      event.stopPropagation()
      if (event.type !== "keydown" || event.isComposing) return
      if (event.key === "Escape") return cancel()
      // With a question to answer, the keys wait for the answer.
      if (conflict) return
      const binding = bindingFromEvent(event)
      if (!binding) return
      const why = refusal(binding)
      if (why) return setMessage(why)
      // The key it already has: nothing to change.
      if (getTable()[target.action].some((other) => sameBinding(other, binding))) return cancel()
      const owner = ownerOf(binding, target.action)
      if (owner) {
        setMessage(null)
        return setConflict({ binding, owner })
      }
      put(target, binding)
    }
    const onPress = (event: PointerEvent) => {
      if (!(event.target instanceof Element) || !event.target.closest("[data-capturing]")) cancel()
    }
    window.addEventListener("keydown", onKey, true)
    window.addEventListener("keyup", onKey, true)
    window.addEventListener("pointerdown", onPress, true)
    return () => {
      window.removeEventListener("keydown", onKey, true)
      window.removeEventListener("keyup", onKey, true)
      window.removeEventListener("pointerdown", onPress, true)
    }
  }, [target, conflict])

  return {
    target,
    conflict,
    message,
    start,
    cancel,
    // Takes the key from the action that has it.
    takeOver: () => {
      if (!target || !conflict || isFixed(conflict.owner)) return
      const { owner, binding } = conflict
      setBindings(owner, getTable()[owner].filter((other) => !sameBinding(other, binding)))
      put(target, binding)
    },
    clear: (action: ActionId, slot: number) => {
      cancel()
      setBindings(action, getTable()[action].filter((_, i) => i !== slot))
    },
  }
}

export type ShortcutEditor = ReturnType<typeof useShortcutEditor>
