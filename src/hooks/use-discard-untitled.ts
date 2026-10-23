import { useEffect, useRef } from "react"
import type { StoredField } from "@/lib/world-fields"
import { deleteWorldEntry } from "@/lib/world-entries"
import type { WorldEntry } from "@/lib/world-entries"
import { isEmptyValue, untitledName } from "@/lib/untitled-entry"

// An entry that was just made and is left with its placeholder name and nothing else in
// it is deleted, quietly, so naming nothing leaves nothing behind. Only for `fresh`
// entries, never one that was merely opened. What counts is read when the page is left,
// and only once the entry and its fields have loaded.
export function useDiscardUntitled(
  fresh: boolean,
  entry: WorldEntry | null | undefined,
  fields: Record<string, StoredField> | null
) {
  const latest = useRef({ entry, fields })
  useEffect(() => {
    latest.current = { entry, fields }
  })

  useEffect(() => {
    if (!fresh) return
    return () => {
      const { entry, fields } = latest.current
      if (!entry || !fields) return
      const untouched =
        entry.name === untitledName(entry.kind) &&
        !entry.revealed &&
        Object.values(fields).every((field) => isEmptyValue(field.value))
      if (untouched) deleteWorldEntry(entry.id).catch(() => {})
    }
  }, [fresh])
}
