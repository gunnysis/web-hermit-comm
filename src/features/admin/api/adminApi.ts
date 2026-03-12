import { createClient } from '@/utils/supabase/client'

export async function checkAppAdmin(userId: string): Promise<boolean> {
  const supabase = createClient()
  const { data } = await supabase
    .from('app_admin')
    .select('user_id')
    .eq('user_id', userId)
    .limit(1)
  return (data?.length ?? 0) > 0
}
