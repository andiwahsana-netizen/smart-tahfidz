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
  let layoutError = null // Variabel untuk menampung error

  try {
    const supabase = await createClient()
    const { data, error: sessionError } = await supabase.auth.getSession()

    if (sessionError) {
      // Jika ada error sesi, simpan pesannya, JANGAN langsung redirect
      layoutError = `Session Error: ${sessionError.message}`
      console.error(layoutError)
    }

    session = data.session

    if (session) {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single()

      if (profileError) {
        layoutError = `Profile Error: ${profileError.message}`
        console.error(layoutError)
      }

      if (profile) {
        safeProfile = profile
      } else {
        safeProfile.nama = session.user.user_metadata?.nama || 'User'
        safeProfile.role = session.user.user_metadata?.role || 'guru'
      }
    }
  } catch (error: any) {
    // Tangkap error fatal (misal Env Variable hilang)
    layoutError = `Fatal Layout Error: ${error.message}`
    console.error(layoutError)
  }

  // Jika ada error, TAMPILKAN di layar agar kita bisa baca
  if (layoutError) {
    return (
      <div style={{ padding: '40px', color: 'red', backgroundColor: 'black', minHeight: '100vh', fontFamily: 'monospace' }}>
        <h1>Error di Server Layout</h1>
        <p>Pesan Error: <strong>{layoutError}</strong></p>
        <p style={{color:'gray', marginTop:'20px'}}>Cek apakah Environment Variables di Vercel sudah benar, dan URL Vercel sudah didaftarkan di Supabase Auth Settings.</p>
      </div>
    )
  }

  // Jika tidak ada sesi (user memang belum login), baru redirect ke login
  if (!session) {
    return redirect('/login')
  }

  // Jika semuanya aman, render dashboard
  return (
    <div className="flex min-h-screen bg-[#0a0f0d]">
      <div className="hidden md:flex flex-shrink-0">
        <AppSidebar profile={safeProfile} />
      </div>

      <main className="flex-1 flex flex-col overflow-hidden">
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