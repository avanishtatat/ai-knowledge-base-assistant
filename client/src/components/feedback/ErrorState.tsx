import { RefreshCw } from 'lucide-react'

interface ErrorStateProps {
  message: string
  onRetry?: () => void
  retryLabel?: string
}

export function ErrorState({
  message,
  onRetry,
  retryLabel = 'Retry',
}: ErrorStateProps) {
  return (
    <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center" role="alert">
      <p className="text-sm text-red-700">{message}</p>
      {onRetry && (
        <button
          type="button"
          className="mt-4 inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
          onClick={onRetry}
        >
          <RefreshCw className="size-4" aria-hidden="true" />
          {retryLabel}
        </button>
      )}
    </div>
  )
}
