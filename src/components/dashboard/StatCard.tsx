import arrow from "@/assets/icons/arrow.svg"
import { Icon } from "@/components/Icon"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

type Props = {
  label: string
  value: string
  change: number
  hint: string
}

export function StatCard({ label, value, change, hint }: Props) {
  const up = change >= 0

  return (
    <Card className="transition-shadow duration-200 hover:shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-muted-foreground text-sm font-medium">
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-2xl font-semibold tracking-tight tabular-nums">
            {value}
          </span>
          <span
            className={cn(
              "flex items-center gap-0.5 text-xs font-medium",
              up ? "text-emerald-600 dark:text-emerald-500" : "text-destructive"
            )}
          >
            <Icon
              src={arrow}
              className={cn("size-3.5", up ? "-rotate-45" : "rotate-45")}
            />
            {Math.abs(change)}%
          </span>
        </div>
        <p className="text-muted-foreground mt-1 text-xs">{hint}</p>
      </CardContent>
    </Card>
  )
}
