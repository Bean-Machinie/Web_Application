import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { deriveAll } from "@/lib/character-derive"
import { templateFor } from "@/lib/character-templates"
import type { CharacterFieldType, FieldConfig } from "@/lib/character-templates/types"
import { sheetFields } from "@/lib/character-sheet"
import {
  addCharacterField,
  fetchCharacter,
  fetchCharacterFields,
  fetchCharacterValues,
  removeCharacterField,
  renameCharacter,
  setCharacterConcept,
  setCharacterPinned,
  setCharacterPortrait,
  setCharacterValue,
  updateCharacterField,
} from "@/lib/characters"
import type { Character, CustomField, StoredValue } from "@/lib/characters"
import { errorMessage } from "@/lib/campaigns"
import type { WorldImage } from "@/lib/world-images"
import { useSuggested } from "./use-suggested"

export type SaveState = "idle" | "saving" | "saved" | "error"

const TEXT_WAIT_MS = 800

// One character with its fields and values, and the changes to them. Each change shows
// at once and goes back if the database says no. Typed text waits for a pause. Use
// with key={id}. `character` is undefined while loading and null if there is none.
export function useCharacter(id: string) {
  const [character, setCharacter] = useState<Character | null | undefined>(undefined)
  const [custom, setCustom] = useState<CustomField[]>([])
  const [values, setValues] = useState<Record<string, StoredValue>>({})
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saveState, setSaveState] = useState<SaveState>("idle")
  const inFlight = useRef(0)
  const waiting = useRef(new Map<string, { value: unknown; timer: number }>())

  useEffect(() => {
    Promise.all([fetchCharacter(id), fetchCharacterFields(id), fetchCharacterValues(id)])
      .then(([found, fields, stored]) => {
        setCharacter(found)
        setCustom(fields)
        setValues(stored)
        setLoaded(true)
      })
      .catch((failure) => setError(errorMessage(failure)))
  }, [id])

  const template = useMemo(
    () => (character ? templateFor(character.templateId, character.templateVersion) : null),
    [character]
  )
  const fields = useMemo(() => (template ? sheetFields(template, custom) : []), [template, custom])
  // Worked out from the values on every change; never stored.
  const derived = useMemo(() => deriveAll(fields, values), [fields, values])

  const track = useCallback(async (save: Promise<unknown>) => {
    inFlight.current += 1
    setSaveState("saving")
    try {
      await save
      return true
    } catch (failure) {
      setError(errorMessage(failure))
      return false
    } finally {
      inFlight.current -= 1
      if (inFlight.current === 0) setSaveState((state) => (state === "saving" ? "saved" : state))
    }
  }, [])

  const send = useCallback(
    (fieldId: string, value: unknown) => track(setCharacterValue(id, fieldId, value)),
    [id, track]
  )

  // Leaving must not drop typing that is still waiting to be sent.
  useEffect(() => {
    const pending = waiting.current
    return () => {
      for (const [fieldId, next] of pending) {
        window.clearTimeout(next.timer)
        setCharacterValue(id, fieldId, next.value).catch(() => {})
      }
      pending.clear()
    }
  }, [id])

  function setValue(fieldId: string, value: unknown, typing = false) {
    setValues((old) => ({ ...old, [fieldId]: { pinned: old[fieldId]?.pinned ?? null, value } }))
    setError(null)
    window.clearTimeout(waiting.current.get(fieldId)?.timer)
    if (!typing) {
      waiting.current.delete(fieldId)
      void send(fieldId, value)
      return
    }
    setSaveState("saving")
    const timer = window.setTimeout(() => {
      waiting.current.delete(fieldId)
      void send(fieldId, value)
    }, TEXT_WAIT_MS)
    waiting.current.set(fieldId, { value, timer })
  }

  async function setPinned(fieldId: string, pinned: boolean) {
    setValues((old) => ({ ...old, [fieldId]: { value: old[fieldId]?.value ?? null, pinned } }))
    await track(setCharacterPinned(id, fieldId, pinned))
  }

  async function edit<K extends "name" | "concept" | "portrait">(key: K, value: Character[K]) {
    setCharacter((old) => old && { ...old, [key]: value })
    const save =
      key === "name"
        ? renameCharacter(id, value as string)
        : key === "concept"
          ? setCharacterConcept(id, value as string)
          : setCharacterPortrait(id, value as WorldImage | null)
    return track(save)
  }

  // The new field, so the page can open its name for typing.
  async function addField(tab: string, type: CharacterFieldType, label: string, config?: FieldConfig) {
    try {
      const added = await addCharacterField(id, tab, type, label, config)
      setCustom((old) => [...old, added])
      return added.id
    } catch (failure) {
      setError(errorMessage(failure))
      return null
    }
  }

  async function changeField(fieldId: string, label: string, config: FieldConfig) {
    setCustom((old) => old.map((field) => (field.id === fieldId ? { ...field, label, config } : field)))
    await track(updateCharacterField(fieldId, label, config))
  }

  async function removeField(fieldId: string) {
    setCustom((old) => old.filter((field) => field.id !== fieldId))
    await track(removeCharacterField(fieldId))
  }

  const unsuggest = useSuggested(values, setValue)

  return {
    character,
    template,
    fields,
    values,
    derived,
    loaded,
    error,
    saveState,
    setValue,
    unsuggest,
    setPinned,
    edit,
    addField,
    changeField,
    removeField,
  }
}
