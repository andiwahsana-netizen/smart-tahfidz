'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export function LinkChildForm() {
  const router = useRouter()
  const supabase = createClient()
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLink = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!code) return
    setLoading(true)

        // 1. Cari santri menggunakan fungsi RPC (bypass RLS untuk pencarian)
    const { data: searchResult, error: findError } = await supabase
      .rpc('search_referral_code', { ref_code: code.toUpperCase() })

    // rpc mengembalikan array, jadi kita cek apakah array nya kosong
    if (findError || !searchResult || searchResult.length === 0) {
      toast.error('Kode referral tidak ditemukan!')
      setLoading(false)
      return
    }

    const santri = searchResult[0] // Ambil data pertama dari hasil pencarian

    // 2. Ambil profile ortu saat ini
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }

    const { data: profile } = await supabase
      .from('profiles')
      .select('linked_santri_ids')
      .eq('id', user.id)
      .single()

    // 3. Cek jika sudah terhubung
    const currentIds = profile?.linked_santri_ids || []
    if (currentIds.includes(santri.id)) {
      toast.error('Akun anak ini sudah terhubung!')
      setLoading(false)
      return
    }

    // 4. Update array linked_santri_ids di profile ortu
    const newIds = [...currentIds, santri.id]
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ linked_santri_ids: newIds })
      .eq('id', user.id)

    if (updateError) {
      toast.error('Gagal menghubungkan: ' + updateError.message)
    } else {
      toast.success(`Berhasil terhubung dengan ${santri.nama}!`)
      setCode('')
      router.refresh() // Refresh halaman agar data anak muncul
    }
    setLoading(false)
  }

  return (
    <form onSubmit={handleLink} className="flex gap-3">
      <input 
        type="text" 
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="Masukkan Kode Referral (Contoh: RZK-827)" 
        className="flex-1 px-4 py-3 bg-[#0a0f0d] border border-[#2dd4a0]/10 rounded-lg text-white uppercase tracking-wider placeholder-[#7a9484]/50 focus:outline-none focus:border-[#2dd4a0]"
        required
      />
      <button 
        type="submit" 
        disabled={loading}
        className="px-6 py-3 bg-gradient-to-r from-[#2dd4a0] to-[#059669] text-white font-bold rounded-lg hover:shadow-lg hover:shadow-[#2dd4a0]/20 transition-all disabled:opacity-70"
      >
        {loading ? '...' : <><i className="fas fa-link mr-2"></i>Hubungkan</>}
      </button>
    </form>
  )
}