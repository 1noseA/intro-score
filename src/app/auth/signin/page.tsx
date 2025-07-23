'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import AuthForm from '@/components/auth/AuthForm'

export default function SignInPage() {
  const router = useRouter()

  const handleSuccess = () => {
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">intro-score</h1>
          <p className="text-gray-600">AI音声分析による自己紹介スキル向上</p>
        </div>

        <AuthForm mode="signin" onSuccess={handleSuccess} />

        <div className="text-center mt-6">
          <p className="text-sm text-gray-600">
            アカウントをお持ちでない方は{' '}
            <Link href="/auth/signup" className="text-blue-600 hover:text-blue-800 font-medium">
              こちらから登録
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}