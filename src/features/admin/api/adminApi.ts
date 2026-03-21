import { createClient } from '@/utils/supabase/client'
import { logger } from '@/lib/logger'

export async function checkAppAdmin(userId: string): Promise<boolean> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('app_admin')
    .select('user_id')
    .eq('user_id', userId)
    .limit(1)
  if (error) {
    logger.error('[checkAppAdmin]', error.message)
    return false
  }
  return (data?.length ?? 0) > 0
}
