import type { ReactNode } from 'react'

interface EmptyStateProps {
  message: string
  description?: string
  children?: ReactNode
}

export function EmptyState({ message, description, children }: EmptyStateProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
      <p className="text-sm font-medium text-slate-900">{message}</p>
      {description && <p className="mt-2 text-sm text-slate-600">{description}</p>}
      {children}
    </div>
  )
}
