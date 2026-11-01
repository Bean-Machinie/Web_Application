import { Skeleton } from "@/components/ui/skeleton"

// Same grid as SettingsRow, so nothing moves when the real rows replace it.
function Row({ controls }: { controls: React.ReactNode }) {
  return (
    <div className="grid gap-2 py-4 sm:grid-cols-[13rem_minmax(0,1fr)] sm:items-center sm:gap-8">
      <div className="grid gap-1.5">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-3 w-40" />
      </div>
      {controls}
    </div>
  )
}

function Group({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <Skeleton className="my-0.5 h-4 w-24" />
      <div className="divide-y border-t">{children}</div>
    </div>
  )
}

const field = <Skeleton className="h-8 w-full sm:max-w-xs" />

// The password and connected accounts sections, while they load.
export function SecuritySkeleton() {
  return (
    <>
      <Group>
        <Row controls={field} />
        <Row controls={field} />
        <Row controls={field} />
      </Group>
      <Group>
        <Row controls={<Skeleton className="h-8 w-full sm:max-w-sm" />} />
      </Group>
    </>
  )
}
