'use client'

import Link from 'next/link'
import { useActionState } from 'react'
import { register } from '@/app/actions/auth'

export default function RegisterPage() {
  const [state, formAction, isPending] = useActionState(register, {})

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-600 to-indigo-800 px-4 py-8">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">🇩🇪</div>
          <h1 className="text-2xl font-bold text-gray-900">Registracija</h1>
          <p className="text-gray-500 text-sm mt-1">Potreban ti je verifikacioni kod od profesora</p>
        </div>

        <form action={formAction} className="space-y-4">
          {state.error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3">
              {state.error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Ime
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Marko"
              />
            </div>
            <div>
              <label htmlFor="surname" className="block text-sm font-medium text-gray-700 mb-1">
                Prezime
              </label>
              <input
                id="surname"
                name="surname"
                type="text"
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Petrović"
              />
            </div>
          </div>

          <div>
            <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-1">
              Korisničko ime
            </label>
            <input
              id="displayName"
              name="displayName"
              type="text"
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="marko_p"
            />
          </div>

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
              autoComplete="new-password"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Min. 6 karaktera"
            />
          </div>

          <div>
            <label htmlFor="verificationCode" className="block text-sm font-medium text-gray-700 mb-1">
              Verifikacioni kod
            </label>
            <input
              id="verificationCode"
              name="verificationCode"
              type="text"
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono tracking-widest"
              placeholder="XXXX-XXXX"
            />
            <p className="text-xs text-gray-400 mt-1">Kod dobijen od profesora nemačkog</p>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold py-2.5 rounded-lg transition"
          >
            {isPending ? 'Registrujem...' : 'Registruj se'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Već imaš nalog?{' '}
          <Link href="/login" className="text-blue-600 font-medium hover:underline">
            Prijavi se
          </Link>
        </p>
      </div>
    </main>
  )
}
