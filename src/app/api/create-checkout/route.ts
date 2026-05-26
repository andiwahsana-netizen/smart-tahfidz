import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Konfigurasi Midtrans
const midtransClient = require('midtrans-client')
let snap = new midtransClient.Snap({
  isProduction: false, // false untuk Sandbox, true untuk Production
  serverKey: process.env.MIDTRANS_SERVER_KEY,
})

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }


  // Ambil nama user untuk ditampilkan di receipt Midtrans
  const { data: profile } = await supabase.from('profiles').select('nama').eq('id', user.id).single()

  // Buat ID Order unik (menggunakan user_id agar mudah di-trace saat webhook)
  // Format: UPGRADE_[user_id]_[timestamp]
  const order_id = `UPGRADE_${user.id}_${Date.now()}` // FULL UUID

  // Parameter transaksi yang dikirim ke Midtrans
  const parameter = {
    transaction_details: {
      order_id: order_id,
      gross_amount: 99000 // Harga Rp 99.000
    },
    item_details: [
      {
        id: 'PRO-PLAN-MONTHLY',
        price: 99000,
        quantity: 1,
        name: 'Tahfidz Smart Paket Pro (1 Bulan)'
      }
    ],
    customer_details: {
      first_name: profile?.nama || 'User',
      email: user.email
    }
  }

  try {
    // Minta Token ke Midtrans
    const transaction = await snap.createTransaction(parameter)
    
    // Kirim token ke frontend agar bisa membuka pop-up Snap
    return NextResponse.json({ snapToken: transaction.token })
  } catch (error: any) {
    console.error('Midtrans Error:', error)
    return NextResponse.json({ error: 'Gagal membuat transaksi' }, { status: 500 })
  }
}