interface LoadingStateProps {
  message: string
}

export function LoadingState({ message }: LoadingStateProps) {
  return (
    <div
      className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-600"
      role="status"
    >
      {message}
    </div>
  )
}
