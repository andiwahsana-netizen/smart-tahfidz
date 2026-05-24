'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export function SendMessageForm({ santriList }: { santriList: any[] }) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const { data: { user } } = await supabase.auth.getUser()

    const { error } = await supabase.from('messages').insert({
      ortu_id: user?.id,
      santri_id: formData.get('santri_id') as string,
      type: formData.get('type') as string,
      content: formData.get('content') as string
    })

    if (error) {
      toast.error('Gagal mengirim pesan: ' + error.message)
    } else {
      toast.success('Pesan berhasil dikirim!')
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <div className="bg-[#111a15] border border-[#2dd4a0]/10 rounded-xl p-6">
      <h3 className="font-bold text-white mb-4">Tulis Pesan Baru</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#7a9484] mb-2">Ditujukan Untuk</label>
            <select name="santri_id" required className="w-full px-4 py-3 bg-[#0a0f0d] border border-[#2dd4a0]/10 rounded-lg text-white focus:outline-none focus:border-[#2dd4a0]">
              <option value="">Pilih Anak</option>
              {santriList.map(s => <option key={s.id} value={s.id}>{s.nama}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#7a9484] mb-2">Jenis Pesan</label>
            <select name="type" required className="w-full px-4 py-3 bg-[#0a0f0d] border border-[#2dd4a0]/10 rounded-lg text-white focus:outline-none focus:border-[#2dd4a0]">
              <option value="pesan_anak">Motivasi untuk Anak</option>
              <option value="masukan_guru">Masukan untuk Guru</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#7a9484] mb-2">Isi Pesan</label>
          <textarea name="content" rows={4} required placeholder="Tulis pesan motivasi atau masukan di sini..." className="w-full px-4 py-3 bg-[#0a0f0d] border border-[#2dd4a0]/10 rounded-lg text-white placeholder-[#7a9484]/50 focus:outline-none focus:border-[#2dd4a0] resize-none"></textarea>
        </div>

        <button type="submit" disabled={loading} className="w-full md:w-auto px-6 py-3 bg-gradient-to-r from-[#2dd4a0] to-[#059669] text-white font-bold rounded-lg hover:shadow-lg hover:shadow-[#2dd4a0]/20 transition-all disabled:opacity-70">
          {loading ? 'Mengirim...' : <><i className="fas fa-paper-plane mr-2"></i>Kirim Pesan</>}
        </button>
      </form>
    </div>
  )
}