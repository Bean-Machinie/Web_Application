import type { User } from "@supabase/supabase-js"
import {
  deletePreviousAvatar,
  hasAvatarChange,
  uploadPendingAvatar,
} from "@/lib/avatar"
import type { AvatarChange } from "@/lib/avatar"
import { supabase } from "@/lib/supabase"
import {
  USERNAME_HINT,
  isValidUsername,
  normalizeUsername,
  setUsername,
} from "@/lib/username"

// Saves everything on the Profile tab. `username` is only passed when it
// changed. It goes first because it is the step most likely to be refused
// (taken), and nothing has been uploaded by then. The database records it
// (that is where uniqueness is checked); it is also written to the user's
// metadata, which is where the app reads the person's own name from.
export async function saveProfile(options: {
  user: User
  description: string
  username: string | null
  avatar: AvatarChange
}) {
  const { user, description, username, avatar } = options

  if (username !== null) {
    if (!isValidUsername(username)) throw new Error(USERNAME_HINT)
    await setUsername(username)
  }

  const photo = await uploadPendingAvatar(user, avatar)
  const { error } = await supabase.auth.updateUser({
    data: {
      ...(username !== null && { username: normalizeUsername(username) }),
      description: description.trim(),
      // Clears the old display name, and any real name or job title saved by
      // earlier versions.
      display_name: null,
      first_name: null,
      last_name: null,
      job_title: null,
      ...photo,
    },
  })
  if (error) throw error

  if (hasAvatarChange(avatar)) await deletePreviousAvatar(user)
}
