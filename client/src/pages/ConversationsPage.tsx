import { useEffect, useState } from 'react'
import {
  ArrowRight,
  Bot,
  FileText,
  MessageSquareText,
  RefreshCw,
  UserRound,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { getConversations } from '../api/conversations.api'
import type { Conversation } from '../types/conversation'

function formatDate(value: string): string {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return 'Unknown date'
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}

export function ConversationsPage() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let isActive = true

    async function loadConversations() {
      setIsLoading(true)
      setError(null)

      try {
        const data = await getConversations()

        if (isActive) {
          setConversations(data)
        }
      } catch {
        if (isActive) {
          setError('Unable to load conversation history. Please try again.')
        }
      } finally {
        if (isActive) {
          setIsLoading(false)
        }
      }
    }

    void loadConversations()

    return () => {
      isActive = false
    }
  }, [reloadKey])

  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 sm:text-3xl">
            Conversation History
          </h1>
          <p className="mt-2 text-sm text-slate-600 sm:text-base">
            Review your previous questions and AI-generated answers
          </p>
        </div>
        <button
          type="button"
          className="inline-flex items-center justify-center gap-2 self-start rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isLoading}
          onClick={() => setReloadKey((value) => value + 1)}
        >
          <RefreshCw className="size-4" aria-hidden="true" />
          Refresh
        </button>
      </div>

      {isLoading && (
        <div className="mt-8 rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-600">
          Loading conversation history…
        </div>
      )}

      {!isLoading && error && (
        <div className="mt-8 rounded-xl border border-red-200 bg-red-50 p-6">
          <p className="text-sm text-red-700">{error}</p>
          <button
            type="button"
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
            onClick={() => setReloadKey((value) => value + 1)}
          >
            <RefreshCw className="size-4" aria-hidden="true" />
            Retry
          </button>
        </div>
      )}

      {!isLoading && !error && conversations.length === 0 && (
        <div className="mt-8 rounded-xl border border-slate-200 bg-white p-8 text-center">
          <MessageSquareText
            className="mx-auto size-7 text-slate-400"
            aria-hidden="true"
          />
          <p className="mt-3 text-sm font-medium text-slate-900">
            No conversations yet.
          </p>
          <Link
            className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700"
            to="/documents"
          >
            Select a document and ask a question
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      )}

      {!isLoading && !error && conversations.length > 0 && (
        <ol className="mt-8 space-y-6">
          {conversations.map((conversation) => (
            <li
              key={conversation.id}
              className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
            >
              <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                <div className="flex min-w-0 items-center gap-2 text-sm font-medium text-slate-900">
                  <FileText
                    className="size-4 shrink-0 text-slate-500"
                    aria-hidden="true"
                  />
                  <span className="truncate">{conversation.documentTitle}</span>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <time
                    className="text-xs text-slate-500"
                    dateTime={conversation.createdAt}
                  >
                    {formatDate(conversation.createdAt)}
                  </time>
                  {conversation.document ? (
                    <Link
                      className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700"
                      to={`/documents/${conversation.document.id}/ask`}
                      state={{ documentName: conversation.documentTitle }}
                    >
                      Ask another question
                      <ArrowRight className="size-4" aria-hidden="true" />
                    </Link>
                  ) : (
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                      Document deleted
                    </span>
                  )}
                </div>
              </div>

              <div className="bg-blue-50 px-5 py-4 sm:px-6">
                <div className="flex items-start gap-3">
                  <div className="rounded-full bg-blue-100 p-2 text-blue-700">
                    <UserRound className="size-4" aria-hidden="true" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
                      Your question
                    </p>
                    <p className="mt-1 whitespace-pre-wrap text-sm text-slate-900">
                      {conversation.question}
                    </p>
                  </div>
                </div>
              </div>

              <div className="px-5 py-5 sm:px-6">
                <div className="flex items-start gap-3">
                  <div className="rounded-full bg-violet-100 p-2 text-violet-700">
                    <Bot className="size-4" aria-hidden="true" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold uppercase tracking-wide text-violet-700">
                      AI answer
                    </p>
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                      {conversation.answer}
                    </p>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}
