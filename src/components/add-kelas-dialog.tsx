'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export function AddKelasDialog() {
  const router = useRouter()
  const supabase = createClient()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const nama = formData.get('nama') as string

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }

    const { error } = await supabase.from('kelas').insert({
      guru_id: user.id,
      nama,
      santri_ids: [] // Awalnya kosong
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
            <DialogTrigger asChild>
        <div className="bg-gradient-to-r from-[#2dd4a0] to-[#059669] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:shadow-lg hover:shadow-[#2dd4a0]/20 transition-all cursor-pointer inline-flex items-center">
          <i className="fas fa-plus mr-2"></i>Buat Kelas Baru
        </div>
      </DialogTrigger>
      <DialogContent className="bg-[#111a15] border border-[#2dd4a0]/10 text-white sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-white">Buat Kelas / Kelompok Baru</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#7a9484] mb-2">Nama Kelas</label>
            <input name="nama" type="text" required className="w-full px-4 py-3 bg-[#0a0f0d] border border-[#2dd4a0]/10 rounded-lg text-white placeholder-[#7a9484]/50 focus:outline-none focus:border-[#2dd4a0]" placeholder="Contoh: Kelas Tahfidz Intensif" />
          </div>
          <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-[#2dd4a0] to-[#059669] text-white font-bold rounded-lg hover:shadow-lg hover:shadow-[#2dd4a0]/20 transition-all disabled:opacity-70">
            {loading ? 'Menyimpan...' : <><i className="fas fa-save"></i> Simpan</>}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  )
}