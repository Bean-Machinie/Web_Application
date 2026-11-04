import { useCallback, useEffect, useRef, useState } from "react"
import type { SaveState } from "@/hooks/use-world-fields"
import { errorMessage } from "@/lib/campaigns"
import { fetchJournalContent, setJournalContent, setJournalTitle } from "@/lib/journal"

const DEBOUNCE_MS = 800

type Pending = { run: () => Promise<void>; timer: number }

// The content of one page, saved after typing stops, and the same for its title.
// `content` is null while loading, and { value } once there, so an empty page
// (value null) is told from one still on its way. Use with key={pageId}.
export function useJournalPage(pageId: string) {
  const [content, setContent] = useState<{ value: unknown } | null>(null)
  const [missing, setMissing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saveState, setSaveState] = useState<SaveState>("idle")
  const pending = useRef(new Map<string, Pending>())
  const inFlight = useRef(0)
  const failed = useRef(false)

  useEffect(() => {
    fetchJournalContent(pageId)
      .then((page) => (page ? setContent({ value: page.content }) : setMissing(true)))
      .catch((failure) => setError(errorMessage(failure)))
  }, [pageId])

  // The indicator settles only once every save has come back.
  const track = useCallback(async (save: Promise<void>) => {
    inFlight.current += 1
    setSaveState("saving")
    try {
      await save
    } catch (failure) {
      failed.current = true
      setError(errorMessage(failure))
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
      track(next.run())
    },
    [track]
  )

  // Leaving the page must not drop an edit that is still waiting to be sent.
  useEffect(() => {
    const waiting = pending.current
    return () => {
      for (const next of waiting.values()) {
        window.clearTimeout(next.timer)
        next.run().catch(() => {})
      }
      waiting.clear()
    }
  }, [])

  function schedule(key: string, run: () => Promise<void>) {
    window.clearTimeout(pending.current.get(key)?.timer)
    const timer = window.setTimeout(() => flush(key), DEBOUNCE_MS)
    pending.current.set(key, { run, timer })
    setError(null)
    setSaveState("saving")
  }

  const saveContent = (value: unknown) => schedule("content", () => setJournalContent(pageId, value))
  const saveTitle = (title: string) => schedule("title", () => setJournalTitle(pageId, title))

  return { content, missing, error, saveState, saveContent, saveTitle }
}
