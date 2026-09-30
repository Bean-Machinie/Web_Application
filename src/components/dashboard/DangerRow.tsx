import { Button } from "@/components/ui/button"

type Props = {
  title: string
  description: string
  action: string
  onClick: () => void
}

export function DangerRow({ title, description, action, onClick }: Props) {
  return (
    <div className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
      <div>
        <p className="text-sm font-medium">{title}</p>
        <p className="text-muted-foreground mt-0.5 text-sm">{description}</p>
      </div>
      <Button variant="destructive" className="shrink-0" onClick={onClick}>
        {action}
      </Button>
    </div>
  )
}
