import type { ReactNode } from "react"
import { Link } from "react-router-dom"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { FullScreenLayout } from "@/components/FullScreenLayout"
import { useCampaign } from "./useCampaign"

type Props = {
  title: string
  description: string
  children: ReactNode
}

// A full-screen card for creating or joining a campaign. It is reached from
// the campaigns page and from the campaign switcher.
export function CampaignFormPage({ title, description, children }: Props) {
  const { current } = useCampaign()
  const back = current
    ? { to: "/app", label: "Back to campaign" }
    : { to: "/campaigns", label: "Back" }

  return (
    <FullScreenLayout>
      <div className="flex w-full max-w-sm flex-col gap-4">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-xl">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </CardHeader>
          <CardContent>{children}</CardContent>
        </Card>
        <Link
          to={back.to}
          className="text-muted-foreground hover:text-foreground text-center text-sm underline-offset-4 hover:underline"
        >
          {back.label}
        </Link>
      </div>
    </FullScreenLayout>
  )
}
