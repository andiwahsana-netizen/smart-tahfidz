import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
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
    
    // 3. PARSING ORDER ID YANG SUDAH FIX (Menggunakan underscore)
    // Format: UPGRADE_uuid-tanpa-strip_timestamp
    const parts = order_id.split('_')
    if (parts.length < 2) return NextResponse.json({ error: 'Invalid Order ID format' }, { status: 400 })
    
    const userId = parts[1] // Ambil UUID utuh

    console.log(`Upgrading user: ${userId} to Pro`)

    // 4. UPDATE DATABASE SUPABASE
    const supabase = createClient()
    const { error } = await (await supabase)
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