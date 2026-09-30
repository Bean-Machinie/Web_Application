import { useCallback, useEffect, useRef, useState } from "react"
import { useAuth } from "@/auth/useAuth"
import { useCampaign } from "@/components/dashboard/useCampaign"
import { errorMessage } from "@/lib/campaigns"
import {
  cacheNotifications,
  cachedNotifications,
  dismissNotification,
  fetchNotificationPage,
  markNotificationsRead,
} from "@/lib/notifications"
import type { AppNotification } from "@/lib/notifications"

function isOlder(a: AppNotification, b: AppNotification) {
  const byTime = Date.parse(a.createdAt) - Date.parse(b.createdAt)
  return byTime !== 0 ? byTime < 0 : a.id < b.id
}

// One page of notifications, newest first, with "load more". Whatever it
// shows is marked as read in the database straight away, but stays flagged as
// new here (`isNew`) for as long as the list is open, so you can see what
// just arrived. It reloads its first page whenever the app refreshes, and
// keeps any extra pages already loaded.
export function useNotificationList(pageSize: number) {
  const userId = useAuth().session!.user.id
  const { refreshKey, refreshUnread } = useCampaign()
  const [loaded, setLoaded] = useState(() => cachedNotifications(userId, pageSize))
  const [fresh, setFresh] = useState<Set<string>>(new Set())
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const marked = useRef(new Set<string>())

  useEffect(() => {
    let stale = false
    fetchNotificationPage(pageSize + 1)
      .then((rows) => {
        if (stale) return
        const page = rows.slice(0, pageSize)
        const more = rows.length > pageSize
        setError(null)
        setLoaded((old) => {
          if (!old || !more) return { items: page, hasMore: more }
          // Keep the older pages already loaded, but let the fresh first
          // page replace what overlaps it (answered invitations, cancelled
          // ones that vanished).
          const last = page[page.length - 1]
          const older = old.items.filter((n) => isOlder(n, last))
          return {
            items: [...page, ...older],
            hasMore: older.length > 0 ? old.hasMore : more,
          }
        })
      })
      .catch((failure) => !stale && setError(errorMessage(failure)))
    return () => {
      stale = true
    }
  }, [pageSize, refreshKey])

  useEffect(() => {
    if (!loaded) return
    const unread = loaded.items.filter(
      (n) => !n.readAt && !marked.current.has(n.id)
    )
    if (unread.length === 0) return

    const ids = unread.map((n) => n.id)
    ids.forEach((id) => marked.current.add(id))
    setFresh((old) => new Set([...old, ...ids]))
    markNotificationsRead(ids)
      .then(refreshUnread)
      .catch(() => ids.forEach((id) => marked.current.delete(id)))
  }, [loaded, refreshUnread])

  // Remember what was shown, with the rows just marked as read recorded as
  // read, so reopening does not show them as new again.
  useEffect(() => {
    if (!loaded) return
    const readNow = new Date().toISOString()
    cacheNotifications(userId, pageSize, {
      ...loaded,
      items: loaded.items.map((n) =>
        !n.readAt && marked.current.has(n.id) ? { ...n, readAt: readNow } : n
      ),
    })
  }, [loaded, userId, pageSize])

  const loadMore = useCallback(async () => {
    if (!loaded || loadingMore) return
    const last = loaded.items[loaded.items.length - 1]
    setLoadingMore(true)
    try {
      const rows = await fetchNotificationPage(pageSize + 1, {
        createdAt: last.createdAt,
        id: last.id,
      })
      setLoaded((old) => {
        const have = new Set(old!.items.map((n) => n.id))
        const next = rows.slice(0, pageSize).filter((n) => !have.has(n.id))
        return { items: [...old!.items, ...next], hasMore: rows.length > pageSize }
      })
    } catch (failure) {
      setError(errorMessage(failure))
    } finally {
      setLoadingMore(false)
    }
  }, [loaded, loadingMore, pageSize])

  async function dismiss(id: string) {
    await dismissNotification(id)
    setLoaded((old) =>
      old && { ...old, items: old.items.filter((n) => n.id !== id) }
    )
  }

  return {
    items: loaded?.items ?? null,
    hasMore: loaded?.hasMore ?? false,
    loadingMore,
    error,
    loadMore,
    dismiss,
    isNew: (n: AppNotification) => !n.readAt || fresh.has(n.id),
  }
}
