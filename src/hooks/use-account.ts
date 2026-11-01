import { useAuth } from "@/auth/useAuth"
import { getInitials, getProfile } from "@/lib/profile"

// What the account's button and menu show of the signed-in person.
export function useAccount() {
  const { session, username } = useAuth()
  const email = session?.user.email ?? ""
  return {
    email,
    initials: session ? getInitials(username, email) : "??",
    avatarUrl: session ? getProfile(session.user).avatarUrl : "",
    name: username || "Account",
  }
}
