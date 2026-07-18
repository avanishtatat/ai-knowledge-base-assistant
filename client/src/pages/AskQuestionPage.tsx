import { useState, type FormEvent } from 'react'
import { ArrowLeft, Bot, FileText, Send, UserRound } from 'lucide-react'
import toast from 'react-hot-toast'
import { Link, useLocation, useParams } from 'react-router-dom'
import { askDocumentQuestion } from '../api/questions.api'
import type { QuestionAnswer } from '../types/question'
import { getApiErrorMessage } from '../utils/apiError'
import { formatDateTime } from '../utils/formatting'

interface AskQuestionLocationState {
  documentName?: unknown
}

export function AskQuestionPage() {
  const { documentId } = useParams<{ documentId: string }>()
  const location = useLocation()
  const [question, setQuestion] = useState('')
  const [answers, setAnswers] = useState<QuestionAnswer[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!documentId || documentId === 'undefined') {
    return (
      <div className="mx-auto max-w-3xl">
        <div className="rounded-xl border border-red-200 bg-red-50 p-6">
          <h1 className="text-xl font-semibold text-red-900">
            Document unavailable
          </h1>
          <p className="mt-2 text-sm text-red-700">
            A document must be selected before asking a question.
          </p>
          <Link
            className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-red-700 hover:text-red-800"
            to="/documents"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            Back to Documents
          </Link>
        </div>
      </div>
    )
  }

  const selectedDocumentId = documentId
  const locationState = location.state as AskQuestionLocationState | null
  const documentName =
    typeof locationState?.documentName === 'string' &&
    locationState.documentName.trim()
      ? locationState.documentName
      : 'Selected document'

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (isSubmitting) {
      return
    }

    const trimmedQuestion = question.trim()

    if (!trimmedQuestion) {
      toast.error('Please enter a question.')
      return
    }

    setIsSubmitting(true)

    try {
      const answer = await askDocumentQuestion(selectedDocumentId, trimmedQuestion)
      setAnswers((currentAnswers) => [...currentAnswers, answer])
      setQuestion('')
      toast.success('Answer generated')
    } catch (error) {
      toast.error(
        getApiErrorMessage(
          error,
          'Unable to answer the question. Please try again.',
        ),
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-4xl">
      <Link
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
        to="/documents"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Back to Documents
      </Link>

      <div className="mt-5">
        <h1 className="text-2xl font-semibold text-slate-900 sm:text-3xl">
          Ask a Question
        </h1>
        <div className="mt-2 flex items-center gap-2 text-sm text-slate-600">
          <FileText className="size-4 shrink-0" aria-hidden="true" />
          <span className="truncate">Ask questions about: {documentName}</span>
        </div>
      </div>

      <form
        className="mt-8 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
        onSubmit={handleSubmit}
      >
        <label
          className="block text-sm font-medium text-slate-700"
          htmlFor="document-question"
        >
          Your question
        </label>
        <textarea
          id="document-question"
          className="mt-2 min-h-32 w-full resize-y rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50"
          value={question}
          placeholder="Ask something about this document…"
          disabled={isSubmitting}
          onChange={(event) => setQuestion(event.target.value)}
        />
        <div className="mt-4 flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isSubmitting}
          >
            <Send className="size-4" aria-hidden="true" />
            {isSubmitting ? 'Generating answer…' : 'Ask Question'}
          </button>
        </div>
      </form>

      <section className="mt-8" aria-labelledby="answers-heading">
        <h2 id="answers-heading" className="text-lg font-semibold text-slate-900">
          Current conversation
        </h2>

        {answers.length === 0 ? (
          <div className="mt-4 rounded-xl border border-slate-200 bg-white p-8 text-center">
            <Bot className="mx-auto size-7 text-slate-400" aria-hidden="true" />
            <p className="mt-3 text-sm text-slate-600">
              Ask something about the selected document to generate an answer.
            </p>
          </div>
        ) : (
          <ol className="mt-4 space-y-6">
            {answers.map((item) => (
              <li
                key={item.conversationId}
                className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
              >
                <div className="bg-blue-50 px-5 py-4 sm:px-6">
                  <div className="flex items-start gap-3">
                    <div className="rounded-full bg-blue-100 p-2 text-blue-700">
                      <UserRound className="size-4" aria-hidden="true" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
                        You asked
                      </p>
                      <p className="mt-1 whitespace-pre-wrap text-sm text-slate-900">
                        {item.question}
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
                        {item.answer}
                      </p>
                      <div className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500">
                        <span>{item.document.title}</span>
                        <span aria-hidden="true">•</span>
                        <time dateTime={item.createdAt}>
                          {formatDateTime(item.createdAt)}
                        </time>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  )
}
