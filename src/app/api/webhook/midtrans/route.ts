import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  const body = await request.json()

  const {
    order_id,
    status_code,
    gross_amount,
    transaction_status,
    signature_key,
    custom_field1 // Ambil User ID dari sini
  } = body

  // 1. Verifikasi Keamanan
  const serverKey = process.env.MIDTRANS_SERVER_KEY
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!serverKey || !supabaseUrl || !supabaseServiceKey) {
    console.error('WEBHOOK ERROR: Env Variables hilang!')
    return NextResponse.json({ error: 'Server config error' }, { status: 500 })
  }

  const mySignatureKey = crypto
    .createHash('sha512')
    .update(order_id + status_code + gross_amount + serverKey)
    .digest('hex')

  if (signature_key !== mySignatureKey) {
    console.error('WEBHOOK ERROR: Signature Key tidak cocok!')
    return NextResponse.json({ error: 'Invalid Signature' }, { status: 403 })
  }

  // 2. Proses jika pembayaran sukses
  if (transaction_status === 'capture' || transaction_status === 'settlement') {
    
    // 3. Ambil User ID dari custom_field1
    const userId = custom_field1

    if (!userId) {
      console.error('WEBHOOK ERROR: User ID tidak ditemukan di custom_field1')
      return NextResponse.json({ error: 'User ID missing' }, { status: 400 })
    }

    console.log(`WEBHOOK INFO: Upgrade user ${userId} ke Pro`)

    // 4. Update Database
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

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

  return NextResponse.json({ status: 'ok' })
}