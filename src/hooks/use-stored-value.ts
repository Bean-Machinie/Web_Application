import { useCallback, useState } from "react"
import { storage } from "@/lib/browser-storage"

// A value remembered in this browser under `key`, read once when the hook starts. `read` turns what
// was stored into the value; it gets null when nothing is stored or storage is blocked, and must
// then, and for text it cannot use, give the default. `write` turns a value into the text kept (a
// value that is a string or a number needs none), and should be the same function every render.
export function useStoredValue<T>(key: string, read: (text: string | null) => T, write: (value: T) => string = String) {
  const [value, setValue] = useState(() => read(storage.getItem(key)))
  const change = useCallback(
    (next: T) => {
      setValue(next)
      storage.setItem(key, write(next))
    },
    [key, write]
  )
  return [value, change] as const
}
