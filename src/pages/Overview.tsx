import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { StatCard } from "@/components/dashboard/StatCard"
import { useAuth } from "@/auth/useAuth"
import { activity, stats } from "./sample-data"

export function Overview() {
  const { session } = useAuth()

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">
          Welcome back
        </h2>
        <p className="text-muted-foreground text-sm">
          Signed in as {session?.user.email}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent activity</CardTitle>
          <CardAction>
            <Badge variant="secondary">Sample</Badge>
          </CardAction>
        </CardHeader>
        <CardContent className="p-0">
          <ul className="divide-y">
            {activity.map((entry) => (
              <li
                key={entry.who}
                className="hover:bg-muted/50 flex items-center justify-between gap-4 px-4 py-3 text-sm transition-colors"
              >
                <span className="truncate">
                  <span className="font-medium">{entry.who}</span>{" "}
                  <span className="text-muted-foreground">{entry.what}</span>
                </span>
                <span className="text-muted-foreground shrink-0 text-xs">
                  {entry.when}
                </span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
