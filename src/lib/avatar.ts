import type { User } from "@supabase/supabase-js"
import { supabase } from "@/lib/supabase"

const BUCKET = "avatars"

export const AVATAR_MAX_BYTES = 2 * 1024 * 1024
export const AVATAR_TYPES = "image/png,image/jpeg,image/webp,image/gif"

// A change the user has picked but not saved yet.
export type AvatarChange = { file: File | null; remove: boolean }
export const NO_AVATAR_CHANGE: AvatarChange = { file: null, remove: false }

export const hasAvatarChange = (change: AvatarChange) =>
  change.file !== null || change.remove

function storedPath(user: User) {
  return (user.user_metadata as { avatar_path?: string }).avatar_path
}

// Uploads into "<folder>/<timestamp>.<ext>" and returns where it went.
export async function uploadImage(
  bucket: string,
  folder: string,
  file: File,
  cacheSeconds?: number
) {
  const extension = file.type.split("/")[1] ?? "png"
  // A fresh name per upload avoids the CDN serving the previous image.
  const path = `${folder}/${Date.now()}.${extension}`

  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      contentType: file.type,
      cacheControl: cacheSeconds === undefined ? undefined : String(cacheSeconds),
    })
  if (error) throw error

  const { data } = supabase.storage.from(bucket).getPublicUrl(path)
  return { url: data.publicUrl, path }
}

export async function deleteImage(bucket: string, path?: string | null) {
  if (path) await supabase.storage.from(bucket).remove([path])
}

// Uploads the new file (if any) and returns the metadata to save with the
// rest of the profile. Nothing is deleted until the metadata is saved.
export async function uploadPendingAvatar(user: User, change: AvatarChange) {
  if (change.remove) return { avatar_url: null, avatar_path: null }
  if (!change.file) return {}

  const { url, path } = await uploadImage(BUCKET, user.id, change.file)
  return { avatar_url: url, avatar_path: path }
}

export const deletePreviousAvatar = (user: User) =>
  deleteImage(BUCKET, storedPath(user))
