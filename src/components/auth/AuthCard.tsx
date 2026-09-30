import type { ReactNode } from "react"
import { LogoMark } from "@/components/LogoMark"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

type Props = {
  title: string
  description: string
  children: ReactNode
  footer: ReactNode
}

export function AuthCard({ title, description, children, footer }: Props) {
  return (
    <div className="flex min-h-svh items-center justify-center p-6">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <div className="flex items-center justify-center gap-2 font-medium">
          <LogoMark className="size-12" />
          Web Application
        </div>
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-xl">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {children}
            <div className="text-muted-foreground text-center text-sm">
              {footer}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
