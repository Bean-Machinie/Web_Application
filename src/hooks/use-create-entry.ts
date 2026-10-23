import { useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { errorMessage } from "@/lib/campaigns"
import { untitledName } from "@/lib/untitled-entry"
import type { WorldScope } from "@/lib/world-scope"
import type { WorldEntryKind } from "@/lib/world-kinds"

// Makes an entry at once, named "Untitled ...", in this scope and opens its page, where
// the title is waiting to be typed over. A failure is a toast, as there is no dialog to
// show it in.
export function useCreateEntry(scope: WorldScope | null) {
  const navigate = useNavigate()

  return useCallback(
    async (kind: WorldEntryKind) => {
      if (!scope) return
      try {
        const entry = await scope.createEntry(kind, untitledName(kind))
        navigate(`${scope.basePath}/${entry.id}`, { state: { justCreated: true } })
      } catch (failure) {
        toast.error(errorMessage(failure))
      }
    },
    [scope, navigate]
  )
}
