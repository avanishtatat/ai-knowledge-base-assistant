import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { register as registerRequest } from '../api/auth.api'
import { useAuth } from '../hooks/useAuth'
import { getApiErrorMessage } from '../utils/apiError'

export function RegisterPage() {
  const navigate = useNavigate()
  const { isAuthenticated, login } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget

    if (!form.reportValidity()) {
      return
    }

    const formData = new FormData(form)
    const name = String(formData.get('name')).trim()
    const email = String(formData.get('email')).trim()
    const password = String(formData.get('password'))

    setIsSubmitting(true)

    try {
      const { token } = await registerRequest({ name, email, password })
      await login(token)
      toast.success('Account created successfully')
      navigate('/dashboard', { replace: true })
    } catch (error) {
      toast.error(
        getApiErrorMessage(
          error,
          'Unable to create your account. Please try again.',
        ),
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <section className="w-full max-w-md rounded-xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
        <h1 className="text-2xl font-semibold text-slate-900">Create an account</h1>
        <p className="mt-2 text-sm text-slate-600">Start building your knowledge base.</p>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <label className="block text-sm font-medium text-slate-700">
            Name
            <input
              className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50"
              type="text"
              name="name"
              autoComplete="name"
              required
              disabled={isSubmitting}
            />
          </label>

          <label className="block text-sm font-medium text-slate-700">
            Email
            <input
              className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50"
              type="email"
              name="email"
              autoComplete="email"
              required
              disabled={isSubmitting}
            />
          </label>

          <label className="block text-sm font-medium text-slate-700">
            Password
            <input
              className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50"
              type="password"
              name="password"
              autoComplete="new-password"
              minLength={6}
              required
              disabled={isSubmitting}
            />
          </label>

          <button
            className="w-full rounded-lg bg-blue-600 px-4 py-2.5 font-medium text-white hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          Already have an account?{' '}
          <Link className="font-medium text-blue-600 hover:text-blue-700" to="/login">
            Sign in
          </Link>
        </p>
      </section>
    </main>
  )
}
