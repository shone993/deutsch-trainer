'use client'

import Link from 'next/link'
import { useActionState } from 'react'
import { login } from '@/app/actions/auth'

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(login, {})

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-600 to-indigo-800 px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">🇩🇪</div>
          <h1 className="text-2xl font-bold text-gray-900">Prijava</h1>
          <p className="text-gray-500 text-sm mt-1">Deutsch Trainer VTŠ</p>
        </div>

        <form action={formAction} className="space-y-4">
          {state.error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3">
              {state.error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="student@vtss.edu.rs"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Lozinka
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold py-2.5 rounded-lg transition"
          >
            {isPending ? 'Prijavljujem...' : 'Prijavi se'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Nemaš nalog?{' '}
          <Link href="/register" className="text-blue-600 font-medium hover:underline">
            Registruj se
          </Link>
        </p>
      </div>
    </main>
  )
}
