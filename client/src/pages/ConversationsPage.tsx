import { useEffect, useState } from 'react'
import {
  ArrowRight,
  Bot,
  FileText,
  MessageSquareText,
  RefreshCw,
  Search,
  UserRound,
  X,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { getConversations } from '../api/conversations.api'
import { EmptyState } from '../components/feedback/EmptyState'
import { ErrorState } from '../components/feedback/ErrorState'
import { LoadingState } from '../components/feedback/LoadingState'
import type { Conversation } from '../types/conversation'
import { formatDateTime } from '../utils/formatting'

export function ConversationsPage() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)
  const normalizedSearchTerm = searchTerm.trim().toLowerCase()
  const filteredConversations = conversations.filter(
    (conversation) =>
      conversation.question.toLowerCase().includes(normalizedSearchTerm) ||
      conversation.documentTitle.toLowerCase().includes(normalizedSearchTerm),
  )

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

      <div className="relative mt-8 max-w-md">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
          aria-hidden="true"
        />
        <input
          type="search"
          className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-9 pr-10 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          aria-label="Search conversations by question or document"
          placeholder="Search questions or documents"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
        />
        {searchTerm && (
          <button
            type="button"
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            aria-label="Clear conversation search"
            onClick={() => setSearchTerm('')}
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        )}
      </div>

      {isLoading && (
        <div className="mt-6">
          <LoadingState message="Loading conversation history…" />
        </div>
      )}

      {!isLoading && error && (
        <div className="mt-6">
          <ErrorState
            message={error}
            onRetry={() => setReloadKey((value) => value + 1)}
          />
        </div>
      )}

      {!isLoading && !error && conversations.length === 0 && (
        <div className="mt-6">
          <EmptyState message="No conversations yet.">
          <MessageSquareText
            className="mx-auto mt-3 size-7 text-slate-400"
            aria-hidden="true"
          />
          <Link
            className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700"
            to="/documents"
          >
            Select a document and ask a question
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
          </EmptyState>
        </div>
      )}

      {!isLoading &&
        !error &&
        conversations.length > 0 &&
        filteredConversations.length === 0 && (
          <div className="mt-6">
            <EmptyState message="No conversations match your search." />
          </div>
        )}

      {!isLoading && !error && filteredConversations.length > 0 && (
        <ol className="mt-6 space-y-6">
          {filteredConversations.map((conversation) => (
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
                    {formatDateTime(conversation.createdAt)}
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
