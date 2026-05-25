import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function Home() {
  try {
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (session) {
      const role = session.user.user_metadata?.role || 'guru'
      redirect(`/${role}`)
    } else {
      redirect('/login')
    }
  } catch (error) {
    console.error('ROOT PAGE CRASHED:', error)
    redirect('/login')
  }
}