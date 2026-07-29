import type { SupabaseClient } from "@supabase/supabase-js"

export const AVATAR_BUCKET = "avatars"
const AVATAR_URL_EXPIRES_IN = 60 * 60 * 24 * 30

function getAvatarPathFromUrl(url?: string) {
  if (!url) return ""

  try {
    const parsedUrl = new URL(url)
    const publicPathMarker = `/storage/v1/object/public/${AVATAR_BUCKET}/`
    const signedPathMarker = `/storage/v1/object/sign/${AVATAR_BUCKET}/`
    const marker = parsedUrl.pathname.includes(publicPathMarker) ? publicPathMarker : signedPathMarker
    const markerIndex = parsedUrl.pathname.indexOf(marker)

    if (markerIndex === -1) return ""

    return decodeURIComponent(parsedUrl.pathname.slice(markerIndex + marker.length))
  } catch {
    return ""
  }
}

export async function getAvatarDisplayUrl(
  supabase: SupabaseClient,
  avatarPath?: string,
  fallbackUrl?: string
) {
  const storagePath = avatarPath || getAvatarPathFromUrl(fallbackUrl)
  if (!storagePath) return fallbackUrl || ""

  const { data, error } = await supabase.storage
    .from(AVATAR_BUCKET)
    .createSignedUrl(storagePath, AVATAR_URL_EXPIRES_IN)

  if (error) {
    console.error("Error creating avatar display URL:", error)
    return fallbackUrl || ""
  }

  return data.signedUrl || fallbackUrl || ""
}
