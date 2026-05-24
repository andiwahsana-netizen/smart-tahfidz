'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation' // TAMBAHKAN IMPORT INI
import { toast } from 'sonner'
import { CreditCard, Crown, Check, X } from 'lucide-react'

export default function BillingPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [isPro, setIsPro] = useState(false)

  // Cek status user saat load
  useEffect(() => {
    const checkStatus = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase.from('profiles').select('subscription_plan').eq('id', user.id).single()
        setIsPro(data?.subscription_plan === 'pro')
      }
    }
    checkStatus()
  }, [supabase])

  const handleUpgrade = async () => {
    setLoading(true)

    try {
      // 1. Minta Snap Token ke backend kita
      const res = await fetch('/api/create-checkout', { method: 'POST' })
      const data = await res.json()

      if (data.error) {
        toast.error(data.error)
        setLoading(false)
        return
      }

      // 2. Buka Pop-up Midtrans Snap
      (window as any).snap.pay(data.snapToken, {
        onSuccess: function(result: any) {
          toast.success('Pembayaran berhasil! Akun Anda sedang di-upgrade...')
          setTimeout(() => {
            router.refresh()
          }, 5000)
        },
        onPending: function(result: any) {
          toast.info('Menunggu pembayaran Anda...')
        },
        onError: function(result: any) {
          toast.error('Pembayaran gagal atau dibatalkan.')
          setLoading(false)
        },
        onClose: function() {
          toast.warning('Anda menutup halaman pembayaran.')
          setLoading(false)
        }
      })

    } catch (error) {
      toast.error('Terjadi kesalahan koneksi.')
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-black text-white">Langganan & Billing</h2>
        <p className="text-[#7a9484] mt-2">Tingkatkan kemampuan manajemen tahfidz Anda.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* PAKET FREE */}
        <div className={`bg-[#111a15] border rounded-2xl p-8 ${isPro ? 'border-[#2dd4a0]/10 opacity-60' : 'border-[#2dd4a0]'}`}>
          <div className="text-sm font-bold text-[#7a9484] mb-4">FREE</div>
          <div className="text-5xl font-black text-white mb-2">Rp 0</div>
          <div className="text-sm text-[#7a9484] mb-8">Selamanya</div>
          
          <button disabled className="w-full py-3 rounded-lg border border-[#2dd4a0]/20 text-[#7a9484] font-semibold mb-8 cursor-not-allowed inline-flex items-center justify-center gap-2">
            {isPro ? 'Downgrade' : 'Paket Aktif'}
          </button>

          <ul className="space-y-4 text-sm">
            <li className="flex items-center text-white"><Check className="w-4 h-4 text-[#2dd4a0] mr-3" />Maksimal 5 Santri</li>
            <li className="flex items-center text-white"><Check className="w-4 h-4 text-[#2dd4a0] mr-3" />1 Akun Guru</li>
            <li className="flex items-center text-[#7a9484]"><X className="w-4 h-4 text-[#7a9484]/50 mr-3" />Manajemen Kelas</li>
            <li className="flex items-center text-[#7a9484]"><X className="w-4 h-4 text-[#7a9484]/50 mr-3" />Notifikasi Real-time</li>
          </ul>
        </div>

        {/* PAKET PRO */}
        <div className={`bg-[#111a15] border rounded-2xl p-8 relative ${isPro ? 'border-purple-500' : 'border-purple-500/50'}`}>
          {!isPro && <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-purple-500 text-white text-xs font-black px-4 py-1 rounded-full uppercase tracking-wider">Populer</div>}
          <div className="text-sm font-bold text-purple-400 mb-4">PRO</div>
          <div className="text-5xl font-black text-white mb-2">Rp 99rb</div>
          <div className="text-sm text-[#7a9484] mb-8">/bulan</div>
          
          {isPro ? (
            <div className="w-full py-3 rounded-lg bg-purple-500/20 text-purple-400 font-semibold text-center mb-8 inline-flex items-center justify-center gap-2">
              <Crown className="w-4 h-4" /> Paket Aktif
            </div>
          ) : (
            <button onClick={handleUpgrade} disabled={loading} className="w-full py-3 rounded-lg bg-gradient-to-r from-purple-500 to-purple-700 text-white font-bold hover:shadow-lg hover:shadow-purple-500/30 transition-all disabled:opacity-70 mb-8 inline-flex items-center justify-center gap-2">
              <CreditCard className="w-4 h-4" /> {loading ? 'Memproses...' : 'Upgrade Sekarang'}
            </button>
          )}

          <ul className="space-y-4 text-sm">
            <li className="flex items-center text-white"><Check className="w-4 h-4 text-purple-400 mr-3" /><strong>Unlimited</strong> Santri</li>
            <li className="flex items-center text-white"><Check className="w-4 h-4 text-purple-400 mr-3" />1 Akun Guru</li>
            <li className="flex items-center text-white"><Check className="w-4 h-4 text-purple-400 mr-3" />Manajemen Kelas</li>
            <li className="flex items-center text-white"><Check className="w-4 h-4 text-purple-400 mr-3" />Notifikasi Real-time Ortu</li>
          </ul>
        </div>
      </div>
    </div>
  )
}