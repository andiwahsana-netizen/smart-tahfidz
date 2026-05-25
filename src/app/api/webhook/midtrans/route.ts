import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  // Liat semua env yg ada kata SUPABASE
  const supabaseEnvs = Object.keys(process.env)
   .filter(key => key.includes('SUPABASE'))
   .reduce((obj, key) => {
      obj[key] =!!process.env[key] // cuma true/false, gak bocorin value
      return obj
    }, {} as Record<string, boolean>)

  console.log('ALL SUPABASE ENVS:', supabaseEnvs)

  return NextResponse.json({
    supabaseEnvs,
    note: 'Cek Vercel Logs buat liat hasilnya'
  })
}