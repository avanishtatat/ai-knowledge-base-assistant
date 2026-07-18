import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Header } from '../components/layout/Header'
import { Sidebar } from '../components/layout/Sidebar'

export function AppLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div className="lg:pl-64">
        <Header onMenuOpen={() => setIsSidebarOpen(true)} />

        <main className="min-h-[calc(100vh-4rem)] p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
