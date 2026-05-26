import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const midtransClient = require('midtrans-client')

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const serverKey = process.env.MIDTRANS_SERVER_KEY
  if (!serverKey) {
    console.error('MIDTRANS_SERVER_KEY tidak ditemukan di Vercel Env!')
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
  }

  let snap = new midtransClient.Snap({
    isProduction: false,
    serverKey: serverKey,
  })

  // 1. Buat Order ID yang PENDEK (aman dari limit 50 karakter Midtrans)
  const orderId = `TXN-${Date.now()}`

  const { data: profile } = await supabase.from('profiles').select('nama').eq('id', user.id).single()

  // 2. Simpan User ID di custom_field1 (aman dari limit order_id)
  const parameter = {
    transaction_details: {
      order_id: orderId,
      gross_amount: 99000
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
    },
    custom_field1: user.id // INI KUNCINYA: Sembunyikan UUID di sini
  }

  try {
    const transaction = await snap.createTransaction(parameter)
    return NextResponse.json({ snapToken: transaction.token })
  } catch (error: any) {
    console.error('Midtrans Create Error:', error.message)
    return NextResponse.json({ error: 'Gagal membuat transaksi di Midtrans' }, { status: 500 })
  }
}