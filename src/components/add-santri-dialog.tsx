'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

function generateReferralCode(nama: string) {
  const prefix = nama.substring(0, 3).toUpperCase()
  const suffix = Math.floor(100 + Math.random() * 900)
  return `${prefix}-${suffix}`
}

// Perbaikan ada di baris bawah ini, menerima props currentSantriCount dan plan
export function AddSantriDialog({ currentSantriCount, plan }: { currentSantriCount: number, plan: string }) {
  const router = useRouter()
  const supabase = createClient()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const isFree = plan === 'free'
  const limitReached = isFree && currentSantriCount >= 5

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (limitReached) return
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const nama = formData.get('nama') as string
    const kelas = formData.get('kelas') as string
    const jk = formData.get('jk') as string

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { toast.error('Anda harus login'); setLoading(false); return }

    const { error } = await supabase.from('santri').insert({
      guru_id: user.id,
      nama,
      kelas,
      jk,
      referral_code: generateReferralCode(nama)
    })

    if (error) {
      toast.error('Gagal Menambahkan: ' + error.message)
    } else {
      setOpen(false)
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
           {limitReached ? (
        <DialogTrigger disabled className="bg-gray-600/50 text-gray-400 px-4 py-2 rounded-lg text-sm font-semibold cursor-not-allowed relative group inline-flex items-center justify-center">
          <i className="fas fa-plus mr-2"></i>Tambah Santri
          <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-red-500 text-white text-xs px-3 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            Batas Free tercapai (5/5)
          </span>
        </DialogTrigger>
      ) : (
        <DialogTrigger className="bg-gradient-to-r from-[#2dd4a0] to-[#059669] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:shadow-lg hover:shadow-[#2dd4a0]/20 transition-all inline-flex items-center justify-center">
          <i className="fas fa-plus mr-2"></i>Tambah Santri
        </DialogTrigger>
      )}
      
      {!limitReached && (
        <DialogContent className="bg-[#111a15] border border-[#2dd4a0]/10 text-white sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-white">Tambah Santri Baru</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#7a9484] mb-2">Nama Lengkap</label>
              <input name="nama" type="text" required className="w-full px-4 py-3 bg-[#0a0f0d] border border-[#2dd4a0]/10 rounded-lg text-white placeholder-[#7a9484]/50 focus:outline-none focus:border-[#2dd4a0]" placeholder="Nama santri" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#7a9484] mb-2">Kelas</label>
                <input name="kelas" type="text" required className="w-full px-4 py-3 bg-[#0a0f0d] border border-[#2dd4a0]/10 rounded-lg text-white placeholder-[#7a9484]/50 focus:outline-none focus:border-[#2dd4a0]" placeholder="Contoh: 3A" />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#7a9484] mb-2">Jenis Kelamin</label>
                <select name="jk" className="w-full px-4 py-3 bg-[#0a0f0d] border border-[#2dd4a0]/10 rounded-lg text-white focus:outline-none focus:border-[#2dd4a0] appearance-none">
                  <option value="Laki-laki">Laki-laki</option>
                  <option value="Perempuan">Perempuan</option>
                </select>
              </div>
            </div>
            <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-[#2dd4a0] to-[#059669] text-white font-bold rounded-lg hover:shadow-lg hover:shadow-[#2dd4a0]/20 transition-all disabled:opacity-70">
              {loading ? 'Menyimpan...' : <><i className="fas fa-save"></i> Simpan</>}
            </button>
          </form>
        </DialogContent>
      )}
    </Dialog>
  )
}