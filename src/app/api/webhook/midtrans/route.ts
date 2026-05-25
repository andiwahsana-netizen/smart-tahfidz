import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  // 1. CEK ENV VARIABLES (PENTING UNTUK DEBUG VERCEL)
  const serverKey = process.env.MIDTRANS_SERVER_KEY
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!serverKey || !supabaseUrl || !supabaseServiceKey) {
    console.error('WEBHOOK ERROR: Environment Variables tidak ditemukan di Vercel!')
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
  }

  // 2. BACA BODY DARI MIDTRANS
  let body
  try {
    body = await request.json()
  } catch (error) {
    console.error('WEBHOOK ERROR: Gagal membaca request body')
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
  }

  const {
    order_id,
    status_code,
    gross_amount,
    transaction_status,
    signature_key
  } = body

  // 3. VERIFIKASI KEAMANAN SIGNATURE
  const mySignatureKey = crypto
    .createHash('sha512')
    .update(order_id + status_code + gross_amount + serverKey)
    .digest('hex')

  if (signature_key !== mySignatureKey) {
    console.error('WEBHOOK ERROR: Signature Key tidak cocok!')
    return NextResponse.json({ error: 'Invalid Signature' }, { status: 403 })
  }

  // 4. PROSES JIKA PEMBAYARAN SUKSES
  if (transaction_status === 'capture' || transaction_status === 'settlement') {
    
    // Parsing Order ID (Format: UPGRADE_uuid_timestamp)
    const parts = order_id.split('_')
    if (parts.length < 2) {
      console.error('WEBHOOK ERROR: Format Order ID salah -> ' + order_id)
      return NextResponse.json({ error: 'Invalid Order ID format' }, { status: 400 })
    }
    
    const userId = parts[1]
    console.log(`WEBHOOK INFO: Menerima pembayaran sukses untuk User ID: ${userId}`)

    // 5. INISIALISASI SUPABASE ADMIN
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

    // 6. UPDATE DATABASE
    const { error } = await supabaseAdmin
      .from('profiles')
      .update({ subscription_plan: 'pro' })
      .eq('id', userId)

    if (error) {
      console.error('WEBHOOK ERROR: Gagal update Supabase -> ', error.message)
      return NextResponse.json({ error: 'Database update failed' }, { status: 500 })
    }

    console.log(`WEBHOOK SUCCESS: User ${userId} berhasil di-upgrade ke PRO!`)
  }

  // Kembalikan 200 ke Midtrans agar Midtrans tidak terus menerus mengirim notifikasi
  return NextResponse.json({ status: 'ok' })
}