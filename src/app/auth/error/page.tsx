'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

export default function AuthError() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Erro na Autenticação</h1>
        <p className="text-zinc-400 mb-4">{error}</p>
        <Link 
          href="/api/auth/signin" 
          className="text-green-500 hover:text-green-400"
        >
          Tentar novamente
        </Link>
      </div>
    </div>
  )
} 