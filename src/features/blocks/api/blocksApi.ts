import { createClient } from '@/utils/supabase/client'
import { logger } from '@/lib/logger'

function extractErrorMessage(error: { message?: string; code?: string; details?: string; hint?: string }): string {
  if (error.message) return error.message
  if (error.code) return `code: ${error.code}`
  if (error.details) return `details: ${error.details}`
  if (error.hint) return `hint: ${error.hint}`

  const keys = Object.keys(error)
  if (keys.length === 0) return 'supabase_empty_error (no fields)'
  return `supabase_error (keys: ${keys.join(',')}) ${JSON.stringify(error)}`
}

export async function blockUser(alias: string): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase.rpc('block_user', { p_alias: alias })
  if (error) {
    const errorMsg = extractErrorMessage(error)
    logger.error('[API] blockUser 에러:', errorMsg, { code: error.code, details: error.details })
    throw new Error(errorMsg)
  }
}

export async function unblockUser(alias: string): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase.rpc('unblock_user', { p_alias: alias })
  if (error) {
    const errorMsg = extractErrorMessage(error)
    logger.error('[API] unblockUser 에러:', errorMsg, { code: error.code, details: error.details })
    throw new Error(errorMsg)
  }
}

export async function getBlockedAliases(): Promise<string[]> {
  const supabase = createClient()
  const { data, error } = await supabase.rpc('get_blocked_aliases')
  if (error) {
    const errorMsg = extractErrorMessage(error)
    logger.error('[API] getBlockedAliases 에러:', errorMsg, { code: error.code })
    throw new Error(errorMsg)
  }
  return (data as string[]) ?? []
}
