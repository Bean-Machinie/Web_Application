import { useCallback, useEffect, useState } from "react"
import { errorMessage } from "@/lib/campaigns"
import {
  createJournalPage,
  deleteJournalPage,
  fetchJournalTree,
  moveJournalPage,
  setJournalRevealed,
  setJournalTitle,
} from "@/lib/journal"
import type { JournalNode } from "@/lib/journal"
import { applyMove, descendantIds } from "@/lib/journal-tree"

// The pages of a campaign's journal. `nodes` is null while loading. Changes show
// at once and are sent after; one the database refuses puts the tree back as it
// is there.
export function useJournalTree(campaignId: string) {
  const [nodes, setNodes] = useState<JournalNode[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(
    () =>
      fetchJournalTree(campaignId)
        .then(setNodes)
        .catch((failure) => setError(errorMessage(failure))),
    [campaignId]
  )

  useEffect(() => {
    load()
  }, [load])

  // Runs a change that is already showing, and undoes it if it fails.
  const send = useCallback(
    async (change: Promise<unknown>) => {
      setError(null)
      try {
        await change
      } catch (failure) {
        setError(errorMessage(failure))
        await load()
      }
    },
    [load]
  )

  const patch = useCallback(
    (id: string, changes: Partial<JournalNode>) =>
      setNodes((old) => old && old.map((node) => (node.id === id ? { ...node, ...changes } : node))),
    []
  )

  async function create(parentId: string | null) {
    setError(null)
    try {
      const page = await createJournalPage(campaignId, parentId)
      setNodes((old) => [...(old ?? []), page])
      return page.id
    } catch (failure) {
      setError(errorMessage(failure))
      return null
    }
  }

  function rename(id: string, title: string) {
    patch(id, { title })
    return send(setJournalTitle(id, title))
  }

  function reveal(id: string, revealed: boolean) {
    patch(id, { revealed })
    return send(setJournalRevealed(id, revealed))
  }

  function move(id: string, parentId: string | null, position: number) {
    setNodes((old) => old && applyMove(old, id, parentId, position))
    return send(moveJournalPage(id, parentId, position))
  }

  async function remove(id: string) {
    const gone = new Set([id, ...descendantIds(nodes ?? [], id)])
    setError(null)
    try {
      await deleteJournalPage(id)
      setNodes((old) => old && old.filter((node) => !gone.has(node.id)))
      return true
    } catch (failure) {
      setError(errorMessage(failure))
      return false
    }
  }

  return { nodes, error, patch, create, rename, reveal, move, remove }
}

export type JournalTreeState = ReturnType<typeof useJournalTree>
