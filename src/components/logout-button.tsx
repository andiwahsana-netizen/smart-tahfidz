'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react' // Ikon bawaan dari Shadcn/Lucide

export function LogoutButton() {
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh() // Penting agar cache server terhapus
  }

  return (
    <button 
      onClick={handleLogout} 
      className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-[#7a9484] hover:bg-red-500/10 hover:text-red-400 transition-colors"
    >
      <LogOut className="w-5 h-5" />
      Keluar
    </button>
  )
}