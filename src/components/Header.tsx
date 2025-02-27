import Link from 'next/link'
import { Home, History, User, Users } from 'lucide-react'

export function Header() {
  return (
    <header className="bg-zinc-900 border-b border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="text-white font-bold text-xl">
          Trackerfy
        </Link>
        
        <nav className="flex gap-6">
          <Link href="/" className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors">
            <Home size={20} />
            <span>Feed</span>
          </Link>
          
          <Link href="/history" className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors">
            <History size={20} />
            <span>Histórico</span>
          </Link>
          
          <Link href="/profile" className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors">
            <User size={20} />
            <span>Perfil</span>
          </Link>
          
          <Link href="/friends" className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors">
            <Users size={20} />
            <span>Amigos</span>
          </Link>
        </nav>
      </div>
    </header>
  )
} 