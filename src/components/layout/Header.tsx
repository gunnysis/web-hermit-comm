import Link from 'next/link'
import { PenSquare, Search, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AdminSecretTap } from './AdminSecretTap'

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-sm">
      <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
        <AdminSecretTap>
          <Link href="/" className="font-bold text-lg tracking-tight">
            은둔마을
          </Link>
        </AdminSecretTap>
        <div className="hidden md:flex items-center gap-1">
          <Button asChild size="icon" variant="ghost">
            <Link href="/search" aria-label="검색">
              <Search size={18} />
            </Link>
          </Button>
          <Button asChild size="icon" variant="ghost">
            <Link href="/groups" aria-label="그룹">
              <Users size={18} />
            </Link>
          </Button>
          <Button asChild size="sm" variant="outline">
            <Link href="/create">
              <PenSquare size={15} />
              글쓰기
            </Link>
          </Button>
        </div>
      </div>
    </header>
  )
}
