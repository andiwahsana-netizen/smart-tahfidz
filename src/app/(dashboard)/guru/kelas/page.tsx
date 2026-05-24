import { createClient } from '@/lib/supabase/server'
import { AddKelasDialog } from '@/components/add-kelas-dialog'
import { ManageAnggotaDialog } from '@/components/manage-anggota-dialog'

export default async function KelasPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  // Ambil semua kelas milik guru
  const { data: kelasList } = await supabase
    .from('kelas')
    .select('*')
    .eq('guru_id', user.id)
    .order('created_at', { ascending: false })

  // Ambil semua santri milik guru (untuk dropdown checkbox)
  const { data: allSantri } = await supabase
    .from('santri')
    .select('id, nama, kelas')
    .eq('guru_id', user.id)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-black text-white">Manajemen Kelas</h2>
          <p className="text-sm text-[#7a9484]">Kelompokkan santri berdasarkan kelas atau tingkatan hafalan.</p>
        </div>
        <AddKelasDialog />
      </div>

      {!kelasList || kelasList.length === 0 ? (
        <div className="text-center py-20 bg-[#111a15] border border-[#2dd4a0]/10 rounded-xl">
          <i className="fas fa-layer-group text-4xl text-[#2dd4a0]/20 mb-4 block"></i>
          <p className="text-[#7a9484]">Belum ada kelas. Buat kelas pertamamu sekarang!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {kelasList.map(kelas => {
            // Cari data santri yang ID-nya ada di array kelas.santri_ids
            const anggota = allSantri?.filter(s => kelas.santri_ids?.includes(s.id)) || []

            return (
              <div key={kelas.id} className="bg-[#111a15] border border-[#2dd4a0]/10 rounded-xl p-6 hover:border-[#2dd4a0]/30 transition-all">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-white">{kelas.nama}</h3>
                    <p className="text-xs text-[#7a9484] mt-1">{anggota.length} Anggota</p>
                  </div>
                  <ManageAnggotaDialog 
                    kelasId={kelas.id} 
                    kelasNama={kelas.nama} 
                    currentSantriIds={kelas.santri_ids || []}
                    allSantri={allSantri || []}
                  />
                </div>

                <div className="border-t border-[#2dd4a0]/10 pt-4 space-y-2">
                  {anggota.length === 0 ? (
                    <p className="text-xs text-[#7a9484] italic">Belum ada anggota ditambahkan</p>
                  ) : (
                    anggota.map(s => (
                      <div key={s.id} className="flex items-center gap-2 bg-[#0a0f0d] px-3 py-1.5 rounded-md">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#2dd4a0] to-[#059669] flex items-center justify-center text-[10px] text-white font-bold">
                          {s.nama.charAt(0)}
                        </div>
                        <span className="text-sm font-medium text-white">{s.nama}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}