'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [isRegister, setIsRegister] = useState(false) // State untuk toggle form

  console.log("URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);
  console.log("KEY:", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);


  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    const { error } = await supabase.auth.signInWithPassword({ email, password })
    
    if (error) {
      toast.error(error.message)
      setLoading(false)
    } else {
      const { data: { user } } = await supabase.auth.getUser()
      const role = user?.user_metadata?.role || 'guru'
      router.push(`/${role}`)
      router.refresh()
    }
  }

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const nama = formData.get('nama') as string
    const username = formData.get('username') as string
    const role = formData.get('role') as string

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { nama, username, role }
      }
    })

    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Pendaftaran berhasil! Silakan login.')
      setIsRegister(false) // Kembali ke form login
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0f0d] relative overflow-hidden">
      {/* Background Glow Effects (Persis seperti vanilla JS) */}
      <div className="absolute top-[-30%] left-[-20%] w-[70vw] h-[70vw] bg-[#2dd4a0]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-40%] right-[-20%] w-[60vw] h-[60vw] bg-[#059669]/5 rounded-full blur-3xl pointer-events-none" />

      {/* Card Utama */}
      <div className="w-full max-w-[440px] bg-[#111a15] border border-[#2dd4a0]/10 rounded-2xl p-8 z-10 shadow-2xl shadow-[#2dd4a0]/5">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-black tracking-tight">
            Tahfidz<span className="text-[#2dd4a0]">Smart</span>
          </h1>
          <p className="text-sm text-[#7a9484] mt-1">Platform Manajemen Tahfidz</p>
        </div>

        {/* Custom Tabs (Agar persis dengan desain) */}
        <div className="flex gap-1 bg-[#0a0f0d] rounded-xl p-1 mb-6">
          <button 
            onClick={() => setIsRegister(false)}
            className={`flex-1 text-center py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${!isRegister ? 'bg-[#2dd4a0]/10 text-[#2dd4a0]' : 'text-[#7a9484] hover:text-white'}`}
          >
            Masuk
          </button>
          <button 
            onClick={() => setIsRegister(true)}
            className={`flex-1 text-center py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${isRegister ? 'bg-[#2dd4a0]/10 text-[#2dd4a0]' : 'text-[#7a9484] hover:text-white'}`}
          >
            Daftar Akun
          </button>
        </div>

        {/* Login Form */}
        {!isRegister ? (
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#7a9484] mb-2">Email</label>
              <input 
                name="email" 
                type="email" 
                placeholder="email@example.com" 
                required 
                className="w-full px-4 py-3 bg-[#0a0f0d] border border-[#2dd4a0]/10 rounded-lg text-white placeholder-[#7a9484]/50 focus:outline-none focus:border-[#2dd4a0] focus:ring-1 focus:ring-[#2dd4a0]/20 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#7a9484] mb-2">Password</label>
              <input 
                name="password" 
                type="password" 
                placeholder="••••••••" 
                required 
                className="w-full px-4 py-3 bg-[#0a0f0d] border border-[#2dd4a0]/10 rounded-lg text-white placeholder-[#7a9484]/50 focus:outline-none focus:border-[#2dd4a0] focus:ring-1 focus:ring-[#2dd4a0]/20 transition-all"
              />
            </div>
            <button 
              type="submit" 
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-[#2dd4a0] to-[#059669] text-white font-bold rounded-lg hover:shadow-lg hover:shadow-[#2dd4a0]/20 hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              ) : (
                <>
                  <i className="fas fa-sign-in-alt" /> Masuk
                </>
              )}
            </button>
          </form>
        ) : (
          /* Register Form */
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#7a9484] mb-2">Nama Lengkap</label>
              <input name="nama" type="text" placeholder="Nama Lengkap" required className="w-full px-4 py-3 bg-[#0a0f0d] border border-[#2dd4a0]/10 rounded-lg text-white placeholder-[#7a9484]/50 focus:outline-none focus:border-[#2dd4a0] focus:ring-1 focus:ring-[#2dd4a0]/20 transition-all" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#7a9484] mb-2">Username</label>
                <input name="username" type="text" placeholder="username" required className="w-full px-4 py-3 bg-[#0a0f0d] border border-[#2dd4a0]/10 rounded-lg text-white placeholder-[#7a9484]/50 focus:outline-none focus:border-[#2dd4a0] focus:ring-1 focus:ring-[#2dd4a0]/20 transition-all" />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#7a9484] mb-2">Daftar Sebagai</label>
                <select name="role" className="w-full px-4 py-3 bg-[#0a0f0d] border border-[#2dd4a0]/10 rounded-lg text-white focus:outline-none focus:border-[#2dd4a0] focus:ring-1 focus:ring-[#2dd4a0]/20 transition-all appearance-none">
                  <option value="guru">Guru</option>
                  <option value="ortu">Orang Tua</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#7a9484] mb-2">Email</label>
              <input name="email" type="email" placeholder="email@example.com" required className="w-full px-4 py-3 bg-[#0a0f0d] border border-[#2dd4a0]/10 rounded-lg text-white placeholder-[#7a9484]/50 focus:outline-none focus:border-[#2dd4a0] focus:ring-1 focus:ring-[#2dd4a0]/20 transition-all" />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#7a9484] mb-2">Password</label>
              <input name="password" type="password" placeholder="Min. 6 karakter" required className="w-full px-4 py-3 bg-[#0a0f0d] border border-[#2dd4a0]/10 rounded-lg text-white placeholder-[#7a9484]/50 focus:outline-none focus:border-[#2dd4a0] focus:ring-1 focus:ring-[#2dd4a0]/20 transition-all" />
            </div>
            <button 
              type="submit" 
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-[#2dd4a0] to-[#059669] text-white font-bold rounded-lg hover:shadow-lg hover:shadow-[#2dd4a0]/20 hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? 'Memproses...' : <><i className="fas fa-user-plus" /> Daftar</>}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}