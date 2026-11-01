import { Link } from "react-router-dom"
import { AuthLayout } from "@/components/auth/AuthLayout"
import { GuestConversion } from "@/components/auth/GuestConversion"
import { logInPath } from "@/lib/auth-next"

// The create account page for someone using Heliosyn as a guest: the same conversion as the
// dialog, never a sign-up, so their work stays with them.
export function GuestCreateAccount({ next }: { next?: string }) {
  return (
    <AuthLayout title="Create your account" description="Everything you've made so far comes with you.">
      <GuestConversion />
      <p className="text-muted-foreground text-center text-sm">
        Already have an account?{" "}
        <Link to={logInPath(next)} className="text-foreground underline underline-offset-4">
          Log in
        </Link>
      </p>
    </AuthLayout>
  )
}
