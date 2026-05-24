'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export function ManageAnggotaDialog({ kelasId, kelasNama, currentSantriIds, allSantri }: { 
  kelasId: string, kelasNama: string, currentSantriIds: string[], allSantri: any[] 
}) {
  const router = useRouter()
  const supabase = createClient()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [selectedIds, setSelectedIds] = useState<string[]>(currentSantriIds)

  const handleToggle = (santriId: string) => {
    setSelectedIds(prev => 
      prev.includes(santriId) ? prev.filter(id => id !== santriId) : [...prev, santriId]
    )
  }

  const handleSave = async () => {
    setLoading(true)
    const { error } = await supabase
      .from('kelas')
      .update({ santri_ids: selectedIds })
      .eq('id', kelasId)

    if (error) {
      toast.error('Gagal update: ' + error.message)
    } else {
      toast.success('Berhasil update anggota kelas!')
      setOpen(false)
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
        <div className="px-3 py-1.5 text-xs font-semibold border border-[#2dd4a0]/20 text-[#2dd4a0] rounded-lg hover:bg-[#2dd4a0]/10 transition-colors cursor-pointer inline-flex items-center">
          <i className="fas fa-user-edit mr-1"></i> Kelola
        </div>
      </DialogTrigger>
      <DialogContent className="bg-[#111a15] border border-[#2dd4a0]/10 text-white sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-white">Kelola Anggota: {kelasNama}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 mt-4 max-h-[40vh] overflow-y-auto pr-2">
          {allSantri.length === 0 ? (
            <p className="text-sm text-[#7a9484]">Belum ada data santri.</p>
          ) : (
            allSantri.map(santri => (
              <label key={santri.id} className="flex items-center gap-3 p-3 bg-[#0a0f0d] rounded-lg cursor-pointer hover:border-[#2dd4a0]/30 border border-transparent transition-colors">
                <input 
                  type="checkbox" 
                  checked={selectedIds.includes(santri.id)}
                  onChange={() => handleToggle(santri.id)}
                  className="w-5 h-5 rounded bg-[#0a0f0d] border-[#2dd4a0]/30 text-[#2dd4a0] focus:ring-[#2dd4a0] focus:ring-offset-0 cursor-pointer"
                />
                <span className="font-semibold text-sm">{santri.nama}</span>
                <span className="text-xs text-[#7a9484] ml-auto">{santri.kelas}</span>
              </label>
            ))
          )}
        </div>
        <button onClick={handleSave} disabled={loading} className="w-full mt-6 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-[#2dd4a0] to-[#059669] text-white font-bold rounded-lg hover:shadow-lg hover:shadow-[#2dd4a0]/20 transition-all disabled:opacity-70">
          {loading ? 'Menyimpan...' : <><i className="fas fa-save"></i> Simpan Perubahan</>}
        </button>
      </DialogContent>
    </Dialog>
  )
}