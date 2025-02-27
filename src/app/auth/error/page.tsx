'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Suspense } from 'react'

function ErrorContent() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  return (
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
  )
}

export default function AuthError() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Suspense fallback={<div>Carregando...</div>}>
        <ErrorContent />
      </Suspense>
    </div>
  )
} 