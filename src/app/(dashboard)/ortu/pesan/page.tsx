import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { SendMessageForm } from '@/components/send-message-form'
import { MessageCircle } from 'lucide-react'

export default async function PesanPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return redirect('/login')

  // Ambil profile dan daftar anak yang terhubung
  const { data: profile } = await supabase.from('profiles').select('linked_santri_ids').eq('id', user.id).single()
  const linkedIds = profile?.linked_santri_ids || []

  if (linkedIds.length === 0) {
    return (
      <div className="text-center py-20 space-y-4">
        <MessageCircle className="w-16 h-16 text-[#2dd4a0]/20 mx-auto" />
        <h2 className="text-xl font-black text-white">Belum Ada Anak Terhubung</h2>
        <p className="text-[#7a9484]">Hubungkan akun santri terlebih dahulu di dashboard untuk mengirim pesan.</p>
      </div>
    )
  }

  const { data: santriList } = await supabase.from('santri').select('id, nama').in('id', linkedIds)
  const { data: messages } = await supabase.from('messages').select('*, santri:santri_id(nama)').eq('ortu_id', user.id).order('created_at', { ascending: false })

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h2 className="text-xl font-black text-white">Pesan & Masukan</h2>
        <p className="text-sm text-[#7a9484]">Berikan motivasi untuk anak atau saran untuk gurunya.</p>
      </div>

      {/* Form Kirim Pesan */}
      <SendMessageForm santriList={santriList || []} />

      {/* Riwayat Pesan */}
      <div className="bg-[#111a15] border border-[#2dd4a0]/10 rounded-xl overflow-hidden">
        <div className="p-5 border-b border-[#2dd4a0]/10">
          <h3 className="font-bold text-white">Riwayat Pesan</h3>
        </div>
        <div className="divide-y divide-[#2dd4a0]/5">
          {!messages || messages.length === 0 ? (
            <div className="p-10 text-center text-[#7a9484]">Belum ada pesan yang terkirim.</div>
          ) : (
            messages.map(msg => (
              <div key={msg.id} className="p-5 hover:bg-[#2dd4a0]/5 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-1 rounded-md font-semibold ${msg.type === 'pesan_anak' ? 'bg-blue-500/10 text-blue-400' : 'bg-purple-500/10 text-purple-400'}`}>
                      {msg.type === 'pesan_anak' ? 'Untuk Anak' : 'Untuk Guru'}
                    </span>
                    <span className="text-xs text-[#7a9484]">Kepada: {msg.santri?.nama}</span>
                  </div>
                  <span className="text-xs text-[#7a9484]">{new Date(msg.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                </div>
                <p className="text-sm text-white leading-relaxed">{msg.content}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}