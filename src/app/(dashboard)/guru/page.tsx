import { createClient } from '@/lib/supabase/server'
import { AddSantriDialog } from '@/components/add-santri-dialog'
import { InputHafalanDialog } from '@/components/input-hafalan-dialog'
import { DeleteSantriButton } from '@/components/delete-santri-button'
import { GuruChart } from '@/components/guru-chart'

export default async function GuruDashboard() {
  const supabase = await createClient()
  
  // Ambil data user login
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  // Ambil profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Ambil data santri milik guru ini
  const { data: santriList } = await supabase
    .from('santri')
    .select('id, nama, kelas, target_juz, referral_code')
    .eq('guru_id', user.id)

  // Ambil log hafalan untuk santri milik guru ini
  const { data: logs } = await supabase
    .from('hafalan_logs')
    .select('santri_id, juz, kelancaran')
    .eq('guru_id', user.id)

  // Proses data ringkasan (Sama seperti logika di vanilla JS)
  const progressData = santriList?.map(s => {
    const sLogs = logs?.filter(l => l.santri_id === s.id) || []
    const currentJuz = sLogs.length > 0 ? Math.max(...sLogs.map(l => l.juz)) : 0
    const totalSetoran = sLogs.length
    const avgK = sLogs.length > 0 
      ? (sLogs.reduce((sum, l) => sum + l.kelancaran, 0) / sLogs.length).toFixed(1) 
      : 0
    
    return { ...s, currentJuz, totalSetoran, avgK }
  }) || []

  const safeProfile = profile || { nama: 'Guru', subscription_plan: 'free' }

  return (
    <div className="space-y-6">
      {/* Welcome Card */}
      <div className="bg-gradient-to-br from-[#2dd4a0]/10 to-[#059669]/5 border border-[#2dd4a0]/10 rounded-xl p-6">
        <p className="text-sm text-[#7a9484]">Assalamu'alaikum,</p>
        <h2 className="text-2xl font-black mt-1 text-white">{safeProfile.nama}</h2>
        <div className="mt-2">
          <span className={`inline-block px-3 py-1 rounded-md text-xs font-bold ${safeProfile.subscription_plan === 'pro' ? 'bg-purple-500/20 text-purple-400' : 'bg-[#2dd4a0]/10 text-[#2dd4a0]'}`}>
            {safeProfile.subscription_plan === 'pro' ? '👑 Paket Pro' : 'Paket Free'}
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#111a15] border border-[#2dd4a0]/10 rounded-xl p-5">
          <p className="text-sm text-[#7a9484] mb-3">Total Santri</p>
          <p className="text-4xl font-black text-white">{santriList?.length || 0}</p>
        </div>
        <div className="bg-[#111a15] border border-[#2dd4a0]/10 rounded-xl p-5">
          <p className="text-sm text-[#7a9484] mb-3">Total Setoran</p>
          <p className="text-4xl font-black text-white">{logs?.length || 0}</p>
        </div>
        
        <div className="bg-[#111a15] border border-[#2dd4a0]/10 rounded-xl p-5">
  <GuruChart data={progressData} />
</div>
      </div>

      {/* Tabel Ringkasan Santri */}
      <div className="bg-[#111a15] border border-[#2dd4a0]/10 rounded-xl overflow-hidden">
        <div className="p-5 border-b border-[#2dd4a0]/10 flex justify-between items-center">
          <h3 className="font-bold text-white">Ringkasan Progress Santri</h3>
        
           {/* Kirim jumlah santri dan paket subscription */}
  <AddSantriDialog 
    currentSantriCount={santriList?.length || 0} 
    plan={safeProfile.subscription_plan} 
  />
        </div>
        
        {progressData.length === 0 ? (
          <div className="p-10 text-center text-[#7a9484]">
            Belum ada data santri. Klik "Tambah Santri" untuk memulai.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[#2dd4a0]/10">
                <th className="px-5 py-3 text-xs font-bold uppercase tracking-wider text-[#7a9484]">Nama</th>
                <th className="px-5 py-3 text-xs font-bold uppercase tracking-wider text-[#7a9484]">Kelas</th>
                <th className="px-5 py-3 text-xs font-bold uppercase tracking-wider text-[#7a9484]">Kode Referral</th> 
                <th className="px-5 py-3 text-xs font-bold uppercase tracking-wider text-[#7a9484]">Progress</th>
                <th className="px-5 py-3 text-xs font-bold uppercase tracking-wider text-[#7a9484]">Kelancaran</th>
                <th className="px-5 py-3 text-xs font-bold uppercase tracking-wider text-[#7a9484]">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {progressData.map((s) => (
                <tr key={s.id} className="border-b border-[#2dd4a0]/5 hover:bg-[#2dd4a0]/5 transition-colors">
                  <td className="px-5 py-4 font-semibold text-white">{s.nama}</td>
                  <td className="px-5 py-4 text-[#7a9484]">{s.kelas}</td>
                
                  <td className="px-5 py-4">
                    <code className="bg-[#2dd4a0]/10 text-[#2dd4a0] px-2.5 py-1 rounded-md text-xs font-bold tracking-widest">
                      {s.referral_code}
                    </code>
                  </td>

                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-full bg-[#2dd4a0]/10 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-[#2dd4a0] to-[#059669] h-2 rounded-full" 
                          style={{ width: `${(s.currentJuz / s.target_juz) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-xs font-bold text-[#2dd4a0] min-w-[40px]">Juz {s.currentJuz}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-white">⭐ {s.avgK}/5</td>
                  <td className="px-5 py-4">
                    <InputHafalanDialog santriId={s.id} santriNama={s.nama} />
                    <DeleteSantriButton santriId={s.id} />
                  </td>
                </tr>
              ))}
            </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}