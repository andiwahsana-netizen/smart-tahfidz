import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  // 1. Cek apakah Env Variables ada
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // 2. Jika tidak ada, berikan pesan error yang sangat jelas
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("=== CLIENT ERROR ===")
    console.error("NEXT_PUBLIC_SUPABASE_URL:", supabaseUrl || "TIDAK DITEMUKAN")
    console.error("NEXT_PUBLIC_SUPABASE_ANON_KEY:", supabaseAnonKey ? "Ada" : "TIDAK DITEMUKAN")
    console.error("Pastikan variabel ini sudah ditambahkan di Vercel Settings -> Environment Variables")
    throw new Error("Supabase URL dan ANON KEY wajib diisi. Cek Vercel Env Variables.")
  }

  // 3. Jika ada, buat client
  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}