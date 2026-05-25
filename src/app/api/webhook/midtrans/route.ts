import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js' // Import langsung dari library
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  const body = await request.json()

  const {
    order_id,
    status_code,
    gross_amount,
    transaction_status,
    signature_key
  } = body

  // 1. VERIFIKASI KEAMANAN
  const serverKey = process.env.MIDTRANS_SERVER_KEY
  const mySignatureKey = crypto
    .createHash('sha512')
    .update(order_id + status_code + gross_amount + serverKey)
    .digest('hex')

  if (signature_key !== mySignatureKey) {
    console.error('Invalid Signature Key')
    return NextResponse.json({ error: 'Invalid Signature' }, { status: 403 })
  }

  // 2. CEK STATUS TRANSAKSI
  if (transaction_status === 'capture' || transaction_status === 'settlement') {
    
    // 3. PARSING ORDER ID
    const parts = order_id.split('_')
    if (parts.length < 2) return NextResponse.json({ error: 'Invalid Order ID format' }, { status: 400 })
    const userId = parts[1]

    console.log(`Upgrading user: ${userId} to Pro`)

    // 4. INISIALISASI SUPABASE PAKAI SERVICE ROLE KEY (ADMIN)
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY! // WAJIB PAKAI INI DI WEBHOOK
    )

    // 5. UPDATE DATABASE (Karena pakai Service Role, RLS diabaikan)
    const { error } = await supabaseAdmin
      .from('profiles')
      .update({ subscription_plan: 'pro' })
      .eq('id', userId)

    if (error) {
      console.error('Supabase Update Error:', error)
      return NextResponse.json({ error: 'Database update failed' }, { status: 500 })
    }

    console.log(`User ${userId} successfully upgraded!`)
  }

  return NextResponse.json({ status: 'ok' })
}