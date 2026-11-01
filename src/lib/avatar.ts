import { supabase } from "@/lib/supabase"

const BUCKET = "avatars"

export const AVATAR_MAX_BYTES = 2 * 1024 * 1024
export const AVATAR_TYPES = "image/png,image/jpeg,image/webp,image/gif"

// A change the user has picked but not saved yet.
export type AvatarChange = { file: File | null; remove: boolean }
export const NO_AVATAR_CHANGE: AvatarChange = { file: null, remove: false }

export const hasAvatarChange = (change: AvatarChange) =>
  change.file !== null || change.remove

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

// Uploads the new file, if there is one, and returns the path to save: a string for a new
// photo, null to remove it, undefined for no change. The database makes the URL from the
// path. Nothing is deleted until the path is saved.
export async function uploadPendingAvatar(userId: string, change: AvatarChange) {
  if (change.remove) return null
  if (!change.file) return undefined

  return (await uploadImage(BUCKET, userId, change.file)).path
}

export const deleteAvatarFile = (path?: string | null) => deleteImage(BUCKET, path)
