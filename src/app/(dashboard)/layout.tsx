import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AppSidebar } from '@/components/app-sidebar'
import { MobileSidebar } from '@/components/mobile-sidebar' // Kita buat di bawah
import { LogoutButton } from '@/components/logout-button'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) return redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single()

  const safeProfile = profile || {
    nama: session.user.user_metadata?.nama || 'User',
    role: session.user.user_metadata?.role || 'guru',
    subscription_plan: 'free'
  }

  return (
    <div className="flex min-h-screen bg-[#0a0f0d]">
      {/* Desktop Sidebar (tersembunyi di mobile) */}
      <div className="hidden md:block">
        <AppSidebar profile={safeProfile} />
      </div>

      <main className="flex-1 flex flex-col overflow-hidden md:ml-40">
        <header className="sticky top-0 z-40 h-16 border-b border-[#2dd4a0]/10 backdrop-blur-md bg-[#0a0f0d]/80 flex items-center justify-between px-4 md:px-8">
          <div className="flex items-center gap-4">
            {/* Hamburger Menu untuk Mobile */}
            <div className="md:hidden">
              <MobileSidebar profile={safeProfile} />
            </div>
            <h2 className="text-xl font-extrabold tracking-tight text-white">Dashboard</h2>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-white hidden sm:block">{safeProfile.nama}</span>
            <div className="w-20 h-10 hidden md:flex items-center justify-center">
              <LogoutButton /> 
            </div>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  )
}