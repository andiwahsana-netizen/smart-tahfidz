'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export function InputHafalanDialog({ santriId, santriNama }: { santriId: string, santriNama: string }) {
  const router = useRouter()
  const supabase = createClient()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [rating, setRating] = useState(0)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (rating === 0) {
      toast.error('Pilih tingkat kelancaran terlebih dahulu!')
      return
    }
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const { data: { user } } = await supabase.auth.getUser()

    const { error } = await supabase.from('hafalan_logs').insert({
      santri_id: santriId,
      guru_id: user?.id,
      date: formData.get('date') as string,
      juz: parseInt(formData.get('juz') as string),
      surah: formData.get('surah') as string,
      ayat: formData.get('ayat') as string,
      kelancaran: rating,
      catatan: formData.get('catatan') as string
    })

    if (error) {
      toast.error('Gagal Menyimpan: ' + error.message)
    } else {
      setOpen(false)
      setRating(0)
      router.refresh() // Refresh server component agar progress bar & tabel update
    }
    setLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="bg-gradient-to-r from-[#2dd4a0] to-[#059669] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:shadow-lg hover:shadow-[#2dd4a0]/20 transition-all">
        <i className="fas fa-plus mr-2"></i>Setor Hafalan
      </DialogTrigger>
      <DialogContent className="bg-[#111a15] border border-[#2dd4a0]/10 text-white sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-white">Catat Setoran: {santriNama}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#7a9484] mb-2">Tanggal</label>
              <input name="date" type="date" required defaultValue={new Date().toISOString().split('T')[0]} className="w-full px-4 py-3 bg-[#0a0f0d] border border-[#2dd4a0]/10 rounded-lg text-white focus:outline-none focus:border-[#2dd4a0]" />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#7a9484] mb-2">Juz (1-30)</label>
              <input name="juz" type="number" min="1" max="30" required className="w-full px-4 py-3 bg-[#0a0f0d] border border-[#2dd4a0]/10 rounded-lg text-white focus:outline-none focus:border-[#2dd4a0]" />
            </div>
          </div>

                   <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#7a9484] mb-2">Surah</label>
              <input name="surah" type="text" required placeholder="Contoh: Al-Baqarah" className="w-full px-4 py-3 bg-[#0a0f0d] border border-[#2dd4a0]/10 rounded-lg text-white placeholder-[#7a9484]/50 focus:outline-none focus:border-[#2dd4a0]" />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#7a9484] mb-2">Ayat</label>
              <input name="ayat" type="text" required placeholder="Contoh: 1-20" className="w-full px-4 py-3 bg-[#0a0f0d] border border-[#2dd4a0]/10 rounded-lg text-white placeholder-[#7a9484]/50 focus:outline-none focus:border-[#2dd4a0]" />
            </div>
          </div>
          {/* Star Rating Interaktif */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#7a9484] mb-2">Kelancaran (1-5)</label>
            <div className="flex gap-3">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  className={`w-11 h-11 rounded-lg border-2 flex items-center justify-center text-xl transition-all duration-150 
                    ${star <= rating 
                      ? 'bg-[#2dd4a0]/10 border-[#2dd4a0] text-[#2dd4a0] scale-110' 
                      : 'bg-[#0a0f0d] border-[#2dd4a0]/10 text-[#7a9484] hover:border-[#2dd4a0]/30'
                    }`}
                >
                  ★
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#7a9484] mb-2">Catatan Guru</label>
            <textarea name="catatan" rows={3} placeholder="Catatan perkembangan santri..." className="w-full px-4 py-3 bg-[#0a0f0d] border border-[#2dd4a0]/10 rounded-lg text-white placeholder-[#7a9484]/50 focus:outline-none focus:border-[#2dd4a0] resize-none" />
          </div>

          <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-[#2dd4a0] to-[#059669] text-white font-bold rounded-lg hover:shadow-lg hover:shadow-[#2dd4a0]/20 transition-all disabled:opacity-70">
            {loading ? 'Menyimpan...' : <><i className="fas fa-save"></i> Simpan Setoran</>}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  )
}