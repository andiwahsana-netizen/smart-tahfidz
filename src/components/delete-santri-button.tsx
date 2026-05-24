'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'
import { toast } from 'sonner'

export function DeleteSantriButton({ santriId }: { santriId: string }) {
  const router = useRouter()
  const supabase = createClient()

  const handleDelete = async () => {
    if (confirm('Apakah Anda yakin ingin menghapus santri ini? Semua riwayat hafalannya juga akan terhapus.')) {
      const { error } = await supabase.from('santri').delete().eq('id', santriId)
      
      if (error) {
        toast.error('Gagal menghapus: ' + error.message)
      } else {
        router.refresh() // Refresh halaman agar data hilang dari tabel
      }
    }
  }

  return (
    <button 
      onClick={handleDelete} 
      className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
      title="Hapus Santri"
    >
      <Trash2 className="w-4 h-4" />
    </button>
  )
}