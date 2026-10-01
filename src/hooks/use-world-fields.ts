import { useCallback, useEffect, useRef, useState } from "react"
import { errorMessage } from "@/lib/campaigns"
import {
  fetchWorldFields,
  setWorldFieldPrivate,
  setWorldFieldValue,
} from "@/lib/world-fields"
import type { StoredField, WorldFieldType } from "@/lib/world-fields"

export type SaveState = "idle" | "saving" | "saved" | "error"

const DEBOUNCE_MS = 800

type Pending = { type: WorldFieldType; value: unknown; timer: number }

// `fields` is null while loading. Use with key={entryId}.
export function useWorldFields(entryId: string) {
  const [fields, setFields] = useState<Record<string, StoredField> | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [saveState, setSaveState] = useState<SaveState>("idle")
  const pending = useRef(new Map<string, Pending>())
  const inFlight = useRef(0)
  const failed = useRef(false)

  useEffect(() => {
    fetchWorldFields(entryId)
      .then(setFields)
      .catch((failure) => setError(errorMessage(failure)))
  }, [entryId])

  // The indicator settles only once every save has come back.
  const track = useCallback(async (save: Promise<void>) => {
    inFlight.current += 1
    setSaveState("saving")
    try {
      await save
      return true
    } catch (failure) {
      failed.current = true
      setError(errorMessage(failure))
      return false
    } finally {
      inFlight.current -= 1
      if (inFlight.current === 0 && pending.current.size === 0) {
        setSaveState(failed.current ? "error" : "saved")
        failed.current = false
      }
    }
  }, [])

  const flush = useCallback(
    (key: string) => {
      const next = pending.current.get(key)
      if (!next) return
      pending.current.delete(key)
      track(setWorldFieldValue(entryId, key, next.type, next.value))
    },
    [entryId, track]
  )

  // Leaving the page must not drop an edit that is still waiting to be sent.
  useEffect(() => {
    const waiting = pending.current
    return () => {
      for (const [key, next] of waiting) {
        window.clearTimeout(next.timer)
        setWorldFieldValue(entryId, key, next.type, next.value).catch(() => {})
      }
      waiting.clear()
    }
  }, [entryId])

  function setValue(key: string, type: WorldFieldType, value: unknown) {
    setFields((old) => old && { ...old, [key]: { ...old[key], private: old[key]?.private ?? false, value } })
    window.clearTimeout(pending.current.get(key)?.timer)
    const timer = window.setTimeout(() => flush(key), DEBOUNCE_MS)
    pending.current.set(key, { type, value, timer })
    setError(null)
    setSaveState("saving")
  }

  async function setPrivate(key: string, type: WorldFieldType, isPrivate: boolean) {
    const apply = (value: boolean) =>
      setFields(
        (old) =>
          old && { ...old, [key]: { ...old[key], value: old[key]?.value ?? null, private: value } }
      )
    apply(isPrivate)
    setError(null)
    const saved = await track(setWorldFieldPrivate(entryId, key, type, isPrivate))
    if (!saved) apply(!isPrivate)
  }

  return { fields, error, saveState, setValue, setPrivate }
}
