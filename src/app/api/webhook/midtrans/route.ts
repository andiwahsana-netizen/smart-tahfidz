import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const envCheck = {
    url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    serviceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
  }
  
  console.log('ENV CHECK:', envCheck)
  
  if (!envCheck.url || !envCheck.serviceKey) {
    return NextResponse.json({ 
      error: 'Missing env', 
      detail: envCheck 
    }, { status: 500 })
  }
  
  return NextResponse.json({ status: 'OK ENV ADA' })
}