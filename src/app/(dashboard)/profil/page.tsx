import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ProfileForm } from '@/components/profile-form'

export default async function ProfilPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return redirect('/login')

  // Ambil data profil lengkap + email dari auth user
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Gabungkan dengan email dari auth (karena email tidak ada di tabel profiles)
  const mergedProfile = {
    ...profile,
    email: user.email
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-black text-white">Profil Akun</h2>
        <p className="text-sm text-[#7a9484]">Kelola informasi pribadi dan keamanan akun Anda.</p>
      </div>

      {/* Avatar Header */}
      <div className="flex items-center gap-5 bg-[#111a15] border border-[#2dd4a0]/10 rounded-xl p-6">
        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#2dd4a0] to-[#059669] flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-[#2dd4a0]/20">
          {mergedProfile?.nama?.charAt(0).toUpperCase() || 'U'}
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">{mergedProfile?.nama}</h3>
          <p className="text-sm text-[#7a9484] capitalize">{mergedProfile?.role === 'guru' ? 'Guru / Ustadz' : 'Orang Tua / Wali'}</p>
        </div>
      </div>

      {/* Form Profil */}
      <ProfileForm profile={mergedProfile} />
    </div>
  )
}