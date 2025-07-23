'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { DatabaseClient } from '@/lib/supabase/database'
import type { User } from '@supabase/supabase-js'

interface AuthGuardProps {
  children: React.ReactNode
  redirectTo?: string
}

export default function AuthGuard({ children, redirectTo = '/auth/signin' }: AuthGuardProps) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const db = new DatabaseClient()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await db.getCurrentUser()
        setUser(currentUser)
        
        if (!currentUser) {
          router.push(redirectTo)
        }
      } catch (error) {
        console.error('Auth check failed:', error)
        router.push(redirectTo)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [router, redirectTo])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">認証状態を確認中...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null // リダイレクト中
  }

  return <>{children}</>
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const db = new DatabaseClient()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await db.getCurrentUser()
        setUser(currentUser)
      } catch (error) {
        console.error('Auth check failed:', error)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  const signOut = async () => {
    try {
      await db.signOut()
      setUser(null)
      window.location.href = '/'
    } catch (error) {
      console.error('Sign out failed:', error)
    }
  }

  return { user, loading, signOut }
}