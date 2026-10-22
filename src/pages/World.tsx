import { useWorldScope } from "@/components/dashboard/useWorldScope"
import { WorldEntryList } from "@/components/dashboard/WorldEntryList"

export function World() {
  const scope = useWorldScope()

  return <WorldEntryList key={scope.key} />
}
