import type { ReactNode } from "react"
import { Card, CardContent } from "@/components/ui/card"

type Props = {
  title: string
  description: string
  children?: ReactNode
}

export function PlaceholderSection({ title, description, children }: Props) {
  return (
    <section className="flex flex-col gap-4">
      <div>
        <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
        <p className="text-muted-foreground text-sm">{description}</p>
      </div>
      <Card className="border-dashed">
        <CardContent className="text-muted-foreground flex min-h-64 items-center justify-center text-sm">
          {children ?? "Nothing here yet."}
        </CardContent>
      </Card>
    </section>
  )
}
