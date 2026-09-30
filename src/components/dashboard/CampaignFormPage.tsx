import type { ReactNode } from "react"
import { Link } from "react-router-dom"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useCampaign } from "./useCampaign"

type Props = {
  title: string
  description: string
  children: ReactNode
}

// A card for creating or joining a campaign, shown inside the app.
export function CampaignFormPage({ title, description, children }: Props) {
  const { current } = useCampaign()
  const back = current ? "/app" : "/app/campaigns"

  return (
    <section className="mx-auto flex w-full max-w-sm flex-col gap-4 pt-6">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>{children}</CardContent>
      </Card>
      <Link
        to={back}
        className="text-muted-foreground hover:text-foreground text-center text-sm underline-offset-4 hover:underline"
      >
        Back
      </Link>
    </section>
  )
}
