import { Menu } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'

interface HeaderProps {
  onMenuOpen: () => void
}

export function Header({ onMenuOpen }: HeaderProps) {
  const { user } = useAuth()

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-6 lg:px-8">
      <button
        type="button"
        className="rounded-md p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 lg:hidden"
        aria-label="Open navigation menu"
        onClick={onMenuOpen}
      >
        <Menu className="size-5" aria-hidden="true" />
      </button>

      <div className="ml-auto min-w-0 text-right">
        <p className="truncate text-sm font-semibold text-slate-900">
          {user?.name ?? 'Account'}
        </p>
        {user?.email && (
          <p className="hidden truncate text-xs text-slate-500 sm:block">
            {user.email}
          </p>
        )}
      </div>
    </header>
  )
}
