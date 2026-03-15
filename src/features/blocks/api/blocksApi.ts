import { createClient } from '@/utils/supabase/client'
import { logger } from '@/lib/logger'

export async function blockUser(alias: string): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase.rpc('block_user', { p_alias: alias })
  if (error) {
    logger.error('[blockUser]', error.message, { code: error.code })
    throw error
  }
}

export async function unblockUser(alias: string): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase.rpc('unblock_user', { p_alias: alias })
  if (error) {
    logger.error('[unblockUser]', error.message, { code: error.code })
    throw error
  }
}

export async function getBlockedAliases(): Promise<string[]> {
  const supabase = createClient()
  const { data, error } = await supabase.rpc('get_blocked_aliases')
  if (error) {
    logger.error('[getBlockedAliases]', error.message, { code: error.code })
    return []
  }
  return (data as string[]) ?? []
}
