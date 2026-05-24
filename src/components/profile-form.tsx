'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export function ProfileForm({ profile }: { profile: any }) {
  const router = useRouter()
  const supabase = createClient()
  
  const [nama, setNama] = useState(profile.nama || '')
  const [username, setUsername] = useState(profile.username || '')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nama || !username) {
      toast.error('Nama dan Username wajib diisi')
      return
    }
    setLoading(true)

    // 1. Update tabel profiles
    const { error: dbError } = await supabase
      .from('profiles')
      .update({ nama, username })
      .eq('id', profile.id)

    if (dbError) {
      if (dbError.code === '23505') { // Error unique constraint (username sudah dipakai)
        toast.error('Username sudah digunakan oleh orang lain!')
      } else {
        toast.error('Gagal update profil: ' + dbError.message)
      }
      setLoading(false)
      return
    }

    // 2. Update password HANYA jika diisi
    if (password) {
      const { error: authError } = await supabase.auth.updateUser({ password: password })
      if (authError) {
        toast.error('Gagal ganti password: ' + authError.message)
        setLoading(false)
        return
      }
    }

    toast.success('Profil berhasil diperbarui!')
    setPassword('') // Kosongkan field password lagi
    router.refresh() // Refresh server component untuk update data di sidebar/topbar
    setLoading(false)
  }

  return (
    <form onSubmit={handleUpdateProfile} className="space-y-6">
      {/* Card Informasi Dasar */}
      <div className="bg-[#111a15] border border-[#2dd4a0]/10 rounded-xl p-6 space-y-5">
        <h3 className="text-lg font-bold text-white">Informasi Akun</h3>
        
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#7a9484] mb-2">Email</label>
          <input 
            type="email" 
            disabled 
            value={profile.email || ''} 
            className="w-full px-4 py-3 bg-[#0a0f0d]/50 border border-[#2dd4a0]/10 rounded-lg text-[#7a9484] cursor-not-allowed" 
          />
          <p className="text-[10px] text-[#7a9484] mt-1">Email tidak dapat diubah.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#7a9484] mb-2">Nama Lengkap</label>
            <input 
              type="text" 
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              required 
              className="w-full px-4 py-3 bg-[#0a0f0d] border border-[#2dd4a0]/10 rounded-lg text-white focus:outline-none focus:border-[#2dd4a0]" 
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#7a9484] mb-2">Username</label>
            <input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required 
              className="w-full px-4 py-3 bg-[#0a0f0d] border border-[#2dd4a0]/10 rounded-lg text-white focus:outline-none focus:border-[#2dd4a0]" 
            />
          </div>
        </div>
      </div>

      {/* Card Ganti Password */}
      <div className="bg-[#111a15] border border-[#2dd4a0]/10 rounded-xl p-6 space-y-5">
        <h3 className="text-lg font-bold text-white">Ubah Password</h3>
        <p className="text-sm text-[#7a9484]">Kosongkan bagian ini jika Anda tidak ingin mengubah password.</p>
        
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#7a9484] mb-2">Password Baru</label>
          <input 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Min. 6 karakter" 
            className="w-full px-4 py-3 bg-[#0a0f0d] border border-[#2dd4a0]/10 rounded-lg text-white placeholder-[#7a9484]/50 focus:outline-none focus:border-[#2dd4a0]" 
          />
        </div>
      </div>

      {/* Tombol Submit */}
      <button 
        type="submit" 
        disabled={loading}
        className="w-full md:w-auto px-8 py-3 bg-gradient-to-r from-[#2dd4a0] to-[#059669] text-white font-bold rounded-lg hover:shadow-lg hover:shadow-[#2dd4a0]/20 transition-all disabled:opacity-70"
      >
        {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
      </button>
    </form>
  )
}