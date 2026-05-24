'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Layers, Users, PlusCircle, CreditCard, Home, UserCog, MessageCircle, Mail } from 'lucide-react' // Ikon dari Lucide
import { LogoutButton } from '@/components/logout-button'


export function AppSidebar({ profile }: { profile: any }) {
  const pathname = usePathname()
  const isGuru = profile.role === 'guru'

  const navItems = isGuru
    ? [
        { name: 'Dashboard', href: '/guru', Icon: LayoutDashboard },
        { name: 'Kelola Kelas', href: '/guru/kelas', Icon: Layers },
        { name: 'Data Santri', href: '/guru/santri', Icon: Users },
        { name: 'Input Hafalan', href: '/guru/input', Icon: PlusCircle },
        { name: 'Pesan Ortu', href: '/guru/pesan-ortu', Icon: Mail },
        { name: 'Langganan', href: '/guru/billing', Icon: CreditCard },
      ]
    : [
        { name: 'Dashboard Anak', href: '/ortu', Icon: Home },
       { name: 'Pesan & Masukan', href: '/ortu/pesan', Icon: MessageCircle },
      ]

       const settingItems = [
    { name: 'Profil Akun', href: '/profil', Icon: UserCog }
  ]

  return (
    <aside className="w-64 bg-[#0d1510] flex flex-col h-screen relative">
      {/* Logo */}
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#2dd4a0] to-[#059669] flex items-center justify-center text-white font-black text-lg">TS</div>
        <h1 className="text-xl font-black">Tahfidz<span className="text-[#2dd4a0]">Smart</span></h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        <div className="text-[10px] font-bold uppercase tracking-wider text-[#7a9484] mb-2 px-3">
          Menu {isGuru ? 'Guru' : 'Orang Tua'}
        </div>
        {navItems.map((item) => {
          const isActive = pathname === item.href
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                ${isActive ? 'bg-[#2dd4a0]/10 text-[#2dd4a0]' : 'text-[#7a9484] hover:bg-[#2dd4a0]/5 hover:text-white'}
              `}
            >
              {/* Menggunakan Komponen Ikon Lucide */}
              <item.Icon className="w-5 h-5" />
              {item.name}
            </Link>
          )
        })}
        <div className="text-[10px] font-bold uppercase tracking-wider text-[#7a9484] mt-6 mb-2 px-3">Pengaturan</div>
        {settingItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link key={item.href} href={item.href} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-[#2dd4a0]/10 text-[#2dd4a0]' : 'text-[#7a9484] hover:bg-[#2dd4a0]/5 hover:text-white'}`}>
              <item.Icon className="w-5 h-5" />
              {item.name}
            </Link>
          )
        })}
      </nav>

      {/* User Card Footer & Logout */}
      <div className="p-4 space-y-2">
        <div className="flex items-center gap-3 p-2 rounded-lg bg-[#2dd4a0]/5">
          <div className="w-8 h-8 rounded-md bg-gradient-to-br from-[#2dd4a0] to-[#059669] flex items-center justify-center text-white font-bold text-xs">
            {profile.nama.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold truncate text-white">{profile.nama}</p>
            <p className="text-[10px] text-[#7a9484]">{isGuru ? 'Guru / Ustadz' : 'Orang Tua'}</p>
          </div>
        </div>
        
        <LogoutButton />
      </div>
    </aside>
  )
}