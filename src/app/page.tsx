import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

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
    console.error('Root Error:', error)
    redirect('/login')
  }
}