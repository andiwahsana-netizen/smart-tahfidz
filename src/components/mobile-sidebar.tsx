'use client'

import { useState } from 'react'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { AppSidebar } from './app-sidebar'
import { Menu } from 'lucide-react'

export function MobileSidebar({ profile }: { profile: any }) {
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
                  <SheetTrigger className="p-2 text-white hover:bg-[#2dd4a0]/10 rounded-lg transition-colors inline-flex items-center justify-center">
        <Menu className="w-6 h-6" />
      </SheetTrigger>
      <SheetContent side="left" className="p-0 w-64 bg-[#0d1510] border-r border-[#2dd4a0]/10">
        {/* Kita pakai ulang AppSidebar, tapi matikan posisi fixed-nya dengan override */}
        <div onClick={() => setOpen(false)}>
          <AppSidebar profile={profile} />
        </div>
      </SheetContent>
    </Sheet>
  )
}