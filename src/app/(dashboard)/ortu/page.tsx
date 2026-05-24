import { createClient } from '@/lib/supabase/server'
import { LinkChildForm } from '@/components/link-child-form'
import { OrtuChart } from '@/components/ortu-chart'

export default async function OrtuDashboard() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  // Ambil profile ortu (berisi array linked_santri_ids)
  const { data: profile } = await supabase
    .from('profiles')
    .select('linked_santri_ids, nama')
    .eq('id', user.id)
    .single()

  const linkedIds = profile?.linked_santri_ids || []

  // Jika belum ada anak terhubung
  if (linkedIds.length === 0) {
    return (
      <div className="max-w-2xl mx-auto mt-20 text-center space-y-6">
        <i className="fas fa-link text-5xl text-[#2dd4a0]/20"></i>
        <h2 className="text-2xl font-black text-white">Hubungkan Akun Anak</h2>
        <p className="text-[#7a9484]">Masukkan kode referral dari guru/Ustadz untuk memantau perkembangan hafalan anak Anda.</p>
        <div className="bg-[#111a15] border border-[#2dd4a0]/10 rounded-xl p-6">
          <LinkChildForm />
        </div>
      </div>
    )
  }

  // Jika sudah ada anak terhubung, ambil data santri & log hafalannya
  const { data: santriList } = await supabase
    .from('santri')
    .select('*')
    .in('id', linkedIds)

  const { data: logs } = await supabase
    .from('hafalan_logs')
    .select('*')
    .in('santri_id', linkedIds)
    .order('date', { ascending: true })

  return (
    <div className="space-y-8">
      {/* Welcome Card */}
      <div className="bg-gradient-to-br from-[#2dd4a0]/10 to-[#059669]/5 border border-[#2dd4a0]/10 rounded-xl p-6">
        <p className="text-sm text-[#7a9484]">Assalamu'alaikum,</p>
        <h2 className="text-2xl font-black mt-1 text-white">{profile?.nama}</h2>
      </div>

      {/* Form Link Anak Tambahan */}
      <div className="bg-[#111a15] border border-[#2dd4a0]/10 rounded-xl p-6">
        <h3 className="font-bold text-white mb-4"><i className="fas fa-plus-circle text-[#2dd4a0] mr-2"></i>Tambah Anak Lain</h3>
        <LinkChildForm />
      </div>

      {/* Looping Tampilan Per Anak */}
      {santriList?.map(santri => {
        const sLogs = logs?.filter(l => l.santri_id === santri.id) || []
        const currentJuz = sLogs.length > 0 ? Math.max(...sLogs.map(l => l.juz)) : 0
        const avgK = sLogs.length > 0 ? (sLogs.reduce((sum, l) => sum + l.kelancaran, 0) / sLogs.length).toFixed(1) : 0
        const recentLogs = [...sLogs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5)

        return (
          <div key={santri.id} className="bg-[#111a15] border border-[#2dd4a0]/10 rounded-xl overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-xl font-black text-white">{santri.nama}</h3>
                  <p className="text-sm text-[#7a9484]">Kelas {santri.kelas}</p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-black text-[#2dd4a0]">Juz {currentJuz}</p>
                  <p className="text-xs text-[#7a9484]">Target: Juz {santri.target_juz}</p>
                </div>
              </div>

              <div className="w-full bg-[#2dd4a0]/10 rounded-full h-2.5 mb-6">
                <div className="bg-gradient-to-r from-[#2dd4a0] to-[#059669] h-2.5 rounded-full" style={{ width: `${(currentJuz / santri.target_juz) * 100}%` }}></div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-[#0a0f0d] p-4 rounded-lg text-center">
                  <p className="text-xs text-[#7a9484] mb-1">Total Setoran</p>
                  <p className="text-2xl font-black text-white">{sLogs.length}</p>
                </div>
                <div className="bg-[#0a0f0d] p-4 rounded-lg text-center">
                  <p className="text-xs text-[#7a9484] mb-1">Rata-rata Kelancaran</p>
                  <p className="text-2xl font-black text-[#2dd4a0]">⭐ {avgK}/5</p>
                </div>
              </div>

              <h4 className="font-bold text-white mb-4">Grafik Tren Kelancaran</h4>
              <div className="bg-[#0a0f0d] p-4 rounded-lg mb-6">
                <OrtuChart logs={sLogs} />
              </div>

              <h4 className="font-bold text-white mb-4">Riwayat Setoran Terbaru</h4>
              <div className="space-y-0 border-l-2 border-[#2dd4a0]/10 ml-2">
                {recentLogs.map(log => (
                  <div key={log.id} className="relative pl-8 pb-6">
                    <div className="absolute left-[-7px] top-1 w-3 h-3 rounded-full bg-[#2dd4a0] border-2 border-[#111a15]"></div>
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-bold text-white">Juz {log.juz} - {log.surah} ({log.ayat})</p>
                        <p className="text-sm text-[#7a9484]">Kelancaran: {'★'.repeat(log.kelancaran)}{'☆'.repeat(5 - log.kelancaran)}</p>
                        {log.catatan && <p className="text-sm text-[#2dd4a0] italic mt-1">"{log.catatan}"</p>}
                      </div>
                      <p className="text-xs text-[#7a9484] whitespace-nowrap">{new Date(log.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          </div>
        )
      })}
    </div>
  )
}