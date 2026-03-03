import { createClient } from '@/utils/supabase/client'

const BUCKET = 'post-images'
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
const MAX_SIZE_BYTES = 5 * 1024 * 1024 // 5MB

export class ImageValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ImageValidationError'
  }
}

export function validateImageFile(file: File): void {
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new ImageValidationError('JPEG, PNG, GIF, WebP 이미지만 업로드할 수 있습니다.')
  }
  if (file.size > MAX_SIZE_BYTES) {
    throw new ImageValidationError('이미지 크기는 5MB 이하여야 합니다.')
  }
}

export async function uploadPostImage(file: File, userId: string): Promise<string> {
  validateImageFile(file)

  const supabase = createClient()
  const ext = file.name.split('.').pop() ?? 'jpg'
  const path = `${userId}/${Date.now()}.${ext}`

  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: '3600',
    upsert: false,
  })
  if (error) throw error

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)
  return data.publicUrl
}
