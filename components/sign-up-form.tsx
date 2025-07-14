'use client'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useActionState, useEffect, useState } from 'react'
import { register, type RegisterActionState } from '@/app/(auth)/actions'
import { toast } from '@/components/toast'

export function SignUpForm({ className, ...props }: React.ComponentPropsWithoutRef<'div'>) {
  const router = useRouter()
  const [repeatPassword, setRepeatPassword] = useState('')
  const [state, formAction] = useActionState<RegisterActionState, FormData>(
    register,
    { status: 'idle' }
  )

  useEffect(() => {
    if (state.status === 'failed') {
      toast({
        type: 'error',
        description: state.error || 'Registration failed. Please try again.',
      })
    } else if (state.status === 'invalid_data') {
      toast({
        type: 'error',
        description: state.error || 'Invalid email or password format.',
      })
    } else if (state.status === 'user_exists') {
      toast({
        type: 'error',
        description: state.error || 'A user with this email already exists.',
      })
    } else if (state.status === 'success') {
      toast({
        type: 'success',
        description: 'Registration successful! Please check your email for verification.',
      })
      router.push('/auth/sign-up-success')
    }
  }, [state.status, state.error, router])

  const handleSubmit = (formData: FormData) => {
    const password = formData.get('password') as string
    const repeatPasswordValue = formData.get('repeat-password') as string
    
    if (password !== repeatPasswordValue) {
      toast({
        type: 'error',
        description: 'Passwords do not match',
      })
      return
    }
    
    formAction(formData)
  }

  const isLoading = state.status === 'in_progress'

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Sign up</CardTitle>
          <CardDescription>Create a new account</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={handleSubmit}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                </div>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="repeat-password">Repeat Password</Label>
                </div>
                <Input
                  id="repeat-password"
                  name="repeat-password"
                  type="password"
                  required
                  value={repeatPassword}
                  onChange={(e) => setRepeatPassword(e.target.value)}
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Creating account...' : 'Sign up'}
              </Button>
            </div>
            <div className="mt-4 text-center text-sm">
              Already have an account?{' '}
              <Link href="/auth/login" className="underline underline-offset-4">
                Login
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
