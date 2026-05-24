import { createClient } from '@/lib/supabase/server'

export default async function PesanOrtuPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  // Ambil ID semua santri milik guru ini
  const { data: santriList } = await supabase.from('santri').select('id').eq('guru_id', user.id)
  const santriIds = santriList?.map(s => s.id) || []

  if (santriIds.length === 0) {
    return <div className="text-center py-20 text-[#7a9484]">Belum ada santri.</div>
  }

  // Ambil pesan yang ditujukan untuk santri milik guru ini
  const { data: messages } = await supabase
    .from('messages')
    .select('*, santri:santri_id(nama)')
    .in('santri_id', santriIds)
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-black text-white">Pesan dari Orang Tua</h2>
        <p className="text-sm text-[#7a9484]">Masukan untuk Anda atau motivasi untuk santri.</p>
      </div>

      <div className="space-y-4">
        {!messages || messages.length === 0 ? (
          <div className="text-center py-20 bg-[#111a15] border border-[#2dd4a0]/10 rounded-xl text-[#7a9484]">
            Belum ada pesan masuk.
          </div>
        ) : (
          messages.map(msg => (
            <div key={msg.id} className="bg-[#111a15] border border-[#2dd4a0]/10 rounded-xl p-6 hover:border-[#2dd4a0]/30 transition-all">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm">OT</div>
                  <div>
                    <p className="font-bold text-white">Orang Tua dari <span className="text-[#2dd4a0]">{msg.santri?.nama}</span></p>
                    <div className="flex gap-2 mt-1">
                      <span className={`text-[10px] px-2 py-0.5 rounded-md font-semibold ${msg.type === 'pesan_anak' ? 'bg-blue-500/10 text-blue-400' : 'bg-purple-500/10 text-purple-400'}`}>
                        {msg.type === 'pesan_anak' ? 'Motivasi Anak' : 'Masukan Guru'}
                      </span>
                    </div>
                  </div>
                </div>
                <span className="text-xs text-[#7a9484]">{new Date(msg.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
              </div>
              <div className="bg-[#0a0f0d] p-4 rounded-lg text-sm text-white leading-relaxed border border-[#2dd4a0]/5">
                {msg.content}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}