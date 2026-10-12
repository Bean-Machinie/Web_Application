import { useAuth } from "@/auth/useAuth"
import { getInitials, getProfile, getUsername } from "@/lib/profile"

// What the account's button and menu show of the signed-in person.
export function useAccount() {
  const { session } = useAuth()
  return {
    email: session?.user.email ?? "",
    initials: session ? getInitials(session.user) : "??",
    avatarUrl: session ? getProfile(session.user).avatarUrl : "",
    name: (session && getUsername(session.user)) || "Account",
  }
}
