import { useState } from "react"
import { EmailReveal } from "@/components/auth/EmailReveal"
import { GuestEmailForm } from "@/components/auth/GuestEmailForm"
import { LinkOAuthButtons } from "@/components/auth/LinkOAuthButtons"
import { OrDivider } from "@/components/auth/OrDivider"
import { Button } from "@/components/ui/button"

// How a guest becomes an account, in the dialog and on the create account page: link a
// provider, or add an email. Either way it is the same user, with everything they made.
export function GuestConversion() {
  const [withEmail, setWithEmail] = useState(false)
  const [sentTo, setSentTo] = useState<string>()

  if (sentTo) {
    return (
      <div className="flex flex-col gap-1 text-center">
        <p className="text-sm font-medium">Check your email to finish creating your account</p>
        <p className="text-muted-foreground text-sm">
          We sent a link to <span className="text-foreground font-medium">{sentTo}</span>.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <LinkOAuthButtons />
      <OrDivider />
      {withEmail ? (
        <EmailReveal>
          <GuestEmailForm onSent={setSentTo} />
        </EmailReveal>
      ) : (
        <Button variant="outline" className="w-full" onClick={() => setWithEmail(true)}>
          Continue with email
        </Button>
      )}
    </div>
  )
}
