import { useWorldScope } from "@/components/dashboard/useWorldScope"
import { WorldEntryList } from "@/components/dashboard/WorldEntryList"

export function Library() {
  const scope = useWorldScope()

  return (
    <div className="mx-auto -mt-2 flex -mb-4 h-[calc(100svh-3.5rem)] w-full max-w-6xl flex-col md:-mt-3 md:-mb-6 md:h-[calc(100svh-3.75rem)]">
      <WorldEntryList key={scope.key} />
    </div>
  )
}
