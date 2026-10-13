import { useWorldScope } from "@/components/dashboard/useWorldScope"
import { WorldEntryList } from "@/components/dashboard/WorldEntryList"

export function Library() {
  const scope = useWorldScope()

  return (
    <div className="mx-auto flex -mb-4 h-[calc(100svh-4rem)] w-full max-w-5xl flex-col md:-mb-6 md:h-[calc(100svh-4.5rem)]">
      <WorldEntryList key={scope.key} />
    </div>
  )
}
