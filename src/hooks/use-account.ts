import { useAuth } from "@/auth/useAuth"
import { getInitials } from "@/lib/profile"

// What the account's button and menu show of the signed-in person.
export function useAccount() {
  const { session, profile } = useAuth()
  const email = session?.user.email ?? ""
  return {
    email,
    initials: session ? getInitials(profile.username, email) : "??",
    avatarUrl: profile.avatarUrl,
    name: profile.username || "Account",
  }
}
