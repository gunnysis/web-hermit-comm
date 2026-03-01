import { createClient } from '@/utils/supabase/client'

export async function signInAnonymously() {
  const supabase = createClient()
  const { data, error } = await supabase.auth.signInAnonymously()
  if (error) throw error
  return data
}

export async function signInWithPassword(email: string, password: string) {
  const supabase = createClient()
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  return data
}

export async function signOut() {
  const supabase = createClient()
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function getCurrentUser() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function getSession() {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  return session
}
