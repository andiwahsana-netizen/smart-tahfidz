import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

// Tambahkan baris ini
export const dynamic = 'force-dynamic'

export default async function Home() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (session) {
    const role = session.user.user_metadata?.role || 'guru'
    redirect(`/${role}`)
  } else {
    redirect('/login')
  }
}