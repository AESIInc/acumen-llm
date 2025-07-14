'use client'

import { Button } from '@/components/ui/button'
import { createGuest, type GuestActionState } from '@/app/(auth)/actions'
import { useActionState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from '@/components/toast'
import { UserPlus } from 'lucide-react'

export function GuestButton() {
  const router = useRouter()
  const [state, action] = useActionState<GuestActionState, void>(
    createGuest,
    { status: 'idle' }
  )

  useEffect(() => {
    if (state.status === 'success') {
      toast({
        type: 'success',
        description: 'Guest session created successfully!',
      })
      router.push('/')
      router.refresh()
    } else if (state.status === 'failed') {
      toast({
        type: 'error',
        description: state.error || 'Failed to create guest session.',
      })
    }
  }, [state.status, state.error, router])

  const isLoading = state.status === 'in_progress'

  return (
    <Button 
      onClick={() => action()}
      variant="secondary"
      disabled={isLoading}
      className="flex items-center gap-2"
    >
      <UserPlus size={16} />
      {isLoading ? 'Creating guest session...' : 'Continue as Guest'}
    </Button>
  )
} 