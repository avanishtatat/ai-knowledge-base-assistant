import { useState, type FormEvent } from 'react'
import axios from 'axios'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { login as loginRequest } from '../api/auth.api'
import { useAuth } from '../hooks/useAuth'
import type { ApiResponse } from '../types/api'

export function LoginPage() {
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
    const email = String(formData.get('email')).trim()
    const password = String(formData.get('password'))

    setIsSubmitting(true)

    try {
      const { token } = await loginRequest({ email, password })
      await login(token)
      toast.success('Welcome back')
      navigate('/dashboard', { replace: true })
    } catch (error) {
      const message = axios.isAxiosError<ApiResponse<unknown>>(error)
        ? error.response?.data.message
        : undefined
      toast.error(message ?? 'Unable to sign in. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <section className="w-full max-w-md rounded-xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
        <h1 className="text-2xl font-semibold text-slate-900">Sign in</h1>
        <p className="mt-2 text-sm text-slate-600">Access your knowledge base.</p>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <label className="block text-sm font-medium text-slate-700">
            Email
            <input
              className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
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
              className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              type="password"
              name="password"
              autoComplete="current-password"
              minLength={6}
              required
              disabled={isSubmitting}
            />
          </label>

          <button
            className="w-full rounded-lg bg-blue-600 px-4 py-2.5 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          Don&apos;t have an account?{' '}
          <Link className="font-medium text-blue-600 hover:text-blue-700" to="/register">
            Register
          </Link>
        </p>
      </section>
    </main>
  )
}
