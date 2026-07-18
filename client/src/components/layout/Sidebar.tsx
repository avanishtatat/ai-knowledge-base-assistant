import {
  FileText,
  LayoutDashboard,
  LogOut,
  MessageSquareText,
  X,
  type LucideIcon,
} from 'lucide-react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

interface NavigationItem {
  label: string
  path: string
  icon: LucideIcon
}

const navigationItems: NavigationItem[] = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Documents', path: '/documents', icon: FileText },
  { label: 'History', path: '/conversations', icon: MessageSquareText },
]

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const navigate = useNavigate()
  const { logout } = useAuth()

  function handleLogout() {
    logout()
    onClose()
    navigate('/login', { replace: true })
  }

  return (
    <>
      {isOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-slate-950/50 lg:hidden"
          aria-label="Close navigation menu"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform duration-200 ease-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-label="Main navigation"
      >
        <div className="flex h-16 items-center justify-between border-b border-slate-200 px-5">
          <span className="text-lg font-bold tracking-tight text-slate-900">
            KnowledgeBase AI
          </span>
          <button
            type="button"
            className="rounded-md p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 lg:hidden"
            aria-label="Close navigation menu"
            onClick={onClose}
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 p-4">
          {navigationItems.map(({ label, path, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`
              }
            >
              <Icon className="size-5 shrink-0" aria-hidden="true" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-slate-200 p-4">
          <button
            type="button"
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-red-50 hover:text-red-700"
            onClick={handleLogout}
          >
            <LogOut className="size-5 shrink-0" aria-hidden="true" />
            Logout
          </button>
        </div>
      </aside>
    </>
  )
}
