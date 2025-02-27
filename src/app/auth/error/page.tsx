'use client'

import { useSearchParams } from 'next/navigation'

export default function AuthError() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Erro na Autenticação</h1>
        <p className="text-red-500">{error}</p>
        <p className="mt-4">
          Por favor, tente{' '}
          <a href="/api/auth/signin" className="text-blue-500 hover:underline">
            fazer login
          </a>{' '}
          novamente.
        </p>
      </div>
    </div>
  )
} 