import { useAuth } from "@/auth/useAuth"
import { getInitials } from "@/lib/profile"

// What the account's button and menu show of the signed-in person.
export function useAccount() {
  const { session, profile, isGuest } = useAuth()
  const email = session?.user.email ?? ""
  return {
    isGuest,
    email,
    // The muted line under the name.
    detail: isGuest ? "Not saved to an account" : email,
    initials: session ? getInitials(profile.username, email) : "??",
    avatarUrl: profile.avatarUrl,
    name: isGuest ? "Guest" : profile.username || "Account",
  }
}
