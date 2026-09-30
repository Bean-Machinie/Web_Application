import type { User } from "@supabase/supabase-js"
import {
  deletePreviousAvatar,
  hasAvatarChange,
  uploadPendingAvatar,
} from "@/lib/avatar"
import type { AvatarChange } from "@/lib/avatar"
import { supabase } from "@/lib/supabase"
import { USERNAME_HINT, isValidUsername, setUsername } from "@/lib/username"

type Details = { displayName: string; description: string }

// Saves everything on the Profile tab. `username` is only passed when it
// changed. The username goes first because it is the step most likely to be
// refused (taken), and nothing has been uploaded by then.
export async function saveProfile(options: {
  user: User
  details: Details
  username: string | null
  avatar: AvatarChange
  // Called as soon as the username is saved, even if a later step fails.
  onUsernameSaved: () => void
}) {
  const { user, details, username, avatar, onUsernameSaved } = options

  if (username !== null) {
    if (!isValidUsername(username)) throw new Error(USERNAME_HINT)
    await setUsername(username)
    onUsernameSaved()
  }

  const photo = await uploadPendingAvatar(user, avatar)
  const { error } = await supabase.auth.updateUser({
    data: {
      display_name: details.displayName.trim(),
      description: details.description.trim(),
      // Clears any real name or job title saved by an earlier version.
      first_name: null,
      last_name: null,
      job_title: null,
      ...photo,
    },
  })
  if (error) throw error

  if (hasAvatarChange(avatar)) await deletePreviousAvatar(user)
}
