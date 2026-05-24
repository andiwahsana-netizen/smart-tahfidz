import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function Home() {
  const supabase = createClient()
  
  // Cek apakah user sudah login
  const { data: { session } } = await (await supabase).auth.getSession()

  if (session) {
    // Jika sudah login, arahkan ke dashboard sesuai role
    const role = session.user.user_metadata?.role || 'guru'
    redirect(`/${role}`)
  } else {
    // Jika belum login, arahkan ke halaman login
    redirect('/login')
  }
}