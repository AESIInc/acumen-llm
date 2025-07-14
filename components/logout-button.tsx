'use client'

import { Button } from '@/components/ui/button'
import { signOut } from '@/app/(auth)/actions'
import { LogOut } from 'lucide-react'

export function LogoutButton() {
  const handleLogout = async () => {
    await signOut()
  }

  return (
    <Button 
      onClick={handleLogout}
      variant="outline"
      size="sm"
      className="flex items-center gap-2"
    >
      <LogOut size={16} />
      Sign out
    </Button>
  )
}
