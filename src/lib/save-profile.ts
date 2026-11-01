import { deleteAvatarFile, hasAvatarChange, uploadPendingAvatar } from "@/lib/avatar"
import type { AvatarChange } from "@/lib/avatar"
import type { OwnProfile } from "@/lib/profile"
import { supabase } from "@/lib/supabase"
import {
  USERNAME_HINT,
  isValidUsername,
  setUsername,
} from "@/lib/username"

// Saves everything on the Profile tab, all of it in the profiles table. `username` and
// `description` are only passed when they changed. The username goes first because it is
// the step most likely to be refused (taken), and nothing has been uploaded by then. A
// photo is uploaded, then saved by its path; the old file is deleted last, and the new one
// if the save is refused.
export async function saveProfile(options: {
  userId: string
  current: OwnProfile
  description: string | null
  username: string | null
  avatar: AvatarChange
}) {
  const { userId, current, description, username, avatar } = options

  if (username !== null) {
    if (!isValidUsername(username)) throw new Error(USERNAME_HINT)
    await setUsername(username)
  }

  if (hasAvatarChange(avatar)) {
    const path = await uploadPendingAvatar(userId, avatar)
    const { error } = await supabase.rpc("set_avatar", { new_path: path ?? null })
    if (error) {
      if (path) await deleteAvatarFile(path).catch(() => {})
      throw error
    }
    await deleteAvatarFile(current.avatarPath).catch(() => {})
  }

  if (description !== null) {
    const { error } = await supabase.rpc("set_description", { new_description: description })
    if (error) throw error
  }
}
