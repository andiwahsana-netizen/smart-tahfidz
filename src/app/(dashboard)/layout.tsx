import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AppSidebar } from '@/components/app-sidebar'
import { MobileSidebar } from '@/components/mobile-sidebar'

export const dynamic = 'force-dynamic'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  let session = null
  let safeProfile = { nama: 'User', role: 'guru', subscription_plan: 'free' }

  try {
    const supabase = await createClient()
    const { data, error: sessionError } = await supabase.auth.getSession()

    if (sessionError) {
      console.error('Session Error:', sessionError.message)
    }

    session = data.session

    if (session) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single()

      if (profile) {
        safeProfile = profile
      } else {
        safeProfile.nama = session.user.user_metadata?.nama || 'User'
        safeProfile.role = session.user.user_metadata?.role || 'guru'
      }
    }
  } catch (error: any) {
    // Jika ada error kritis (misal Env Variable Supabase tidak ada di Vercel),
    // Catat di log Vercel, dan arahkan ke login agar tidak layar hitam.
    console.error('DASHBOARD LAYOUT CRASHED:', error.message)
    return redirect('/login')
  }

  // Jika tidak ada session, lempar ke login
  if (!session) {
    return redirect('/login')
  }

  return (
    <div className="flex min-h-screen bg-[#0a0f0d]">
      <div className="hidden md:block">
        <AppSidebar profile={safeProfile} />
      </div>

      <main className="flex-1 flex flex-col overflow-hidden md:ml-64">
        <header className="sticky top-0 z-40 h-16 border-b border-[#2dd4a0]/10 backdrop-blur-md bg-[#0a0f0d]/80 flex items-center justify-between px-4 md:px-8">
          <div className="flex items-center gap-4">
            <div className="md:hidden">
              <MobileSidebar profile={safeProfile} />
            </div>
            <h2 className="text-xl font-extrabold tracking-tight text-white">Dashboard</h2>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-white hidden sm:block">{safeProfile.nama}</span>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  )
}