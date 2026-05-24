'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function InputHafalanPage() {
  const router = useRouter()
  const supabase = createClient()
  
  const [kelasList, setKelasList] = useState<any[]>([])
  const [santriList, setSantriList] = useState<any[]>([])
  const [filteredSantri, setFilteredSantri] = useState<any[]>([])
  const [rating, setRating] = useState(0)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: kelas } = await supabase.from('kelas').select('*').eq('guru_id', user.id)
    const { data: santri } = await supabase.from('santri').select('*').eq('guru_id', user.id)
    
    setKelasList(kelas || [])
    setSantriList(santri || [])
    setFilteredSantri(santri || [])
  }

  const handleFilterKelas = (kelasId: string) => {
    if (!kelasId) {
      setFilteredSantri(santriList)
    } else {
      const kelas = kelasList.find(k => k.id === kelasId)
      const ids = kelas?.santri_ids || []
      setFilteredSantri(santriList.filter(s => ids.includes(s.id)))
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (rating === 0) return alert('Pilih kelancaran terlebih dahulu!')
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const { data: { user } } = await supabase.auth.getUser()

    const { error } = await supabase.from('hafalan_logs').insert({
      santri_id: formData.get('santri_id') as string,
      guru_id: user?.id,
      date: formData.get('date') as string,
      juz: parseInt(formData.get('juz') as string),
      surah: formData.get('surah') as string,
      ayat: formData.get('ayat') as string,
      kelancaran: rating,
      catatan: formData.get('catatan') as string
    })

    if (error) {
      alert('Error: ' + error.message)
    } else {
      alert('Setoran berhasil dicatat!')
      setRating(0)
      // Reset form logic could go here
    }
    setLoading(false)
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-black text-white">Catat Setoran Baru</h2>
        <p className="text-sm text-[#7a9484]">Input hafalan santri secara detail.</p>
      </div>

      <div className="bg-[#111a15] border border-[#2dd4a0]/10 rounded-xl p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#7a9484] mb-2">Filter Kelas</label>
              <select name="kelas_filter" onChange={(e) => handleFilterKelas(e.target.value)} className="w-full px-4 py-3 bg-[#0a0f0d] border border-[#2dd4a0]/10 rounded-lg text-white focus:outline-none focus:border-[#2dd4a0]">
                <option value="">Semua Santri</option>
                {kelasList.map(k => <option key={k.id} value={k.id}>{k.nama}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#7a9484] mb-2">Pilih Santri</label>
              <select name="santri_id" required className="w-full px-4 py-3 bg-[#0a0f0d] border border-[#2dd4a0]/10 rounded-lg text-white focus:outline-none focus:border-[#2dd4a0]">
                <option value="">-- Pilih --</option>
                {filteredSantri.map(s => <option key={s.id} value={s.id}>{s.nama} ({s.kelas})</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#7a9484] mb-2">Tanggal</label>
              <input name="date" type="date" required defaultValue={new Date().toISOString().split('T')[0]} className="w-full px-4 py-3 bg-[#0a0f0d] border border-[#2dd4a0]/10 rounded-lg text-white focus:outline-none focus:border-[#2dd4a0]" />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#7a9484] mb-2">Juz (1-30)</label>
              <input name="juz" type="number" min="1" max="30" required className="w-full px-4 py-3 bg-[#0a0f0d] border border-[#2dd4a0]/10 rounded-lg text-white focus:outline-none focus:border-[#2dd4a0]" />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#7a9484] mb-2">Surah</label>
              <input name="surah" type="text" required className="w-full px-4 py-3 bg-[#0a0f0d] border border-[#2dd4a0]/10 rounded-lg text-white focus:outline-none focus:border-[#2dd4a0]" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#7a9484] mb-2">Ayat</label>
            <input name="ayat" type="text" required className="w-full px-4 py-3 bg-[#0a0f0d] border border-[#2dd4a0]/10 rounded-lg text-white focus:outline-none focus:border-[#2dd4a0]" />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#7a9484] mb-2">Kelancaran (1-5)</label>
            <div className="flex gap-3">
              {[1, 2, 3, 4, 5].map((star) => (
                <button type="button" key={star} onClick={() => setRating(star)} className={`w-12 h-12 rounded-lg border-2 flex items-center justify-center text-2xl transition-all ${star <= rating ? 'bg-[#2dd4a0]/10 border-[#2dd4a0] text-[#2dd4a0] scale-110' : 'bg-[#0a0f0d] border-[#2dd4a0]/10 text-[#7a9484]'}`}>
                  ★
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#7a9484] mb-2">Catatan Guru</label>
            <textarea name="catatan" rows={3} className="w-full px-4 py-3 bg-[#0a0f0d] border border-[#2dd4a0]/10 rounded-lg text-white focus:outline-none focus:border-[#2dd4a0] resize-none" />
          </div>

          <button type="submit" disabled={loading} className="w-full py-3 bg-gradient-to-r from-[#2dd4a0] to-[#059669] text-white font-bold rounded-lg hover:shadow-lg hover:shadow-[#2dd4a0]/20 transition-all disabled:opacity-70">
            {loading ? 'Menyimpan...' : 'Simpan Setoran'}
          </button>
        </form>
      </div>
    </div>
  )
}