import type { ReactNode } from "react"
import mapImage from "@/assets/tools/map-builder.png"
import { BrandLogo } from "@/components/BrandLogo"

type Props = {
  title: string
  description?: ReactNode
  children: ReactNode
}

export function AuthLayout({ title, description, children }: Props) {
  return (
    <div className="grid min-h-svh md:grid-cols-2">
      <div className="auth-form flex items-center justify-center p-6">
        <div className="flex w-full max-w-sm flex-col gap-6">
          <BrandLogo />
          <div className="flex flex-col gap-1 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
            {description && (
              <p className="text-muted-foreground text-sm">{description}</p>
            )}
          </div>
          {children}
        </div>
      </div>
      <div className="bg-muted relative hidden md:block">
        <img
          draggable={false}
          src={mapImage}
          alt=""
          className="absolute inset-0 size-full object-cover dark:brightness-75"
        />
      </div>
    </div>
  )
}
