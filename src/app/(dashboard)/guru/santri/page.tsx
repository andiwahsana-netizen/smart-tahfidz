import { createClient } from '@/lib/supabase/server'
import { AddSantriDialog } from '@/components/add-santri-dialog'
import { DeleteSantriButton } from '@/components/delete-santri-button'
import { InputHafalanDialog } from '@/components/input-hafalan-dialog'

export default async function DataSantriPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase.from('profiles').select('subscription_plan').eq('id', user.id).single()
  const { data: santriList } = await supabase.from('santri').select('*').eq('guru_id', user.id).order('nama', { ascending: true })

  const plan = profile?.subscription_plan || 'free'

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-black text-white">Data Santri</h2>
          <p className="text-sm text-[#7a9484]">Kelola seluruh data santri tahfidz Anda.</p>
        </div>
        <AddSantriDialog currentSantriCount={santriList?.length || 0} plan={plan} />
      </div>

      <div className="bg-[#111a15] border border-[#2dd4a0]/10 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[#2dd4a0]/10">
                <th className="px-5 py-3 text-xs font-bold uppercase tracking-wider text-[#7a9484]">Nama</th>
                <th className="px-5 py-3 text-xs font-bold uppercase tracking-wider text-[#7a9484]">Kelas</th>
                <th className="px-5 py-3 text-xs font-bold uppercase tracking-wider text-[#7a9484]">JK</th>
                <th className="px-5 py-3 text-xs font-bold uppercase tracking-wider text-[#7a9484]">Kode Referral</th>
                <th className="px-5 py-3 text-xs font-bold uppercase tracking-wider text-[#7a9484]">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {!santriList || santriList.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-[#7a9484]">Belum ada data santri.</td>
                </tr>
              ) : (
                santriList.map((s) => (
                  <tr key={s.id} className="border-b border-[#2dd4a0]/5 hover:bg-[#2dd4a0]/5 transition-colors">
                    <td className="px-5 py-4 font-semibold text-white">{s.nama}</td>
                    <td className="px-5 py-4 text-[#7a9484]">{s.kelas}</td>
                    <td className="px-5 py-4 text-[#7a9484]">{s.jk}</td>
                    <td className="px-5 py-4">
                      <code className="bg-[#2dd4a0]/10 text-[#2dd4a0] px-2.5 py-1 rounded-md text-xs font-bold tracking-widest">
                        {s.referral_code}
                      </code>
                    </td>
                    <td className="px-5 py-4">
                       <InputHafalanDialog santriId={s.id} santriNama={s.nama} />
                      <DeleteSantriButton santriId={s.id} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}