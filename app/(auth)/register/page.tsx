'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useActionState } from 'react'
import { register } from '@/app/actions/auth'
import { useTranslation } from '@/lib/i18n/LanguageContext'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'

export default function RegisterPage() {
  const [state, formAction, isPending] = useActionState(register, {})
  const { t } = useTranslation()
  const r = t.register

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-sky-500 to-sky-700 px-4 py-8">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-8">
        {/* Logo */}
        <div className="text-center mb-5">
          <div className="flex justify-center mb-3">
            <Image src="/vts-transparent.png" alt="VTŠ Subotica" width={100} height={50} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{r.title}</h1>
          <p className="text-gray-500 text-sm mt-1">{r.subtitle}</p>
        </div>

        {/* Odabir jezika */}
        <div className="mb-5">
          <LanguageSwitcher />
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
                {r.nameLabel}
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                placeholder="Marko"
              />
            </div>
            <div>
              <label htmlFor="surname" className="block text-sm font-medium text-gray-700 mb-1">
                {r.surnameLabel}
              </label>
              <input
                id="surname"
                name="surname"
                type="text"
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                placeholder="Petrović"
              />
            </div>
          </div>

          <div>
            <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-1">
              {r.usernameLabel}
            </label>
            <input
              id="displayName"
              name="displayName"
              type="text"
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
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
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              placeholder="student@vtss.edu.rs"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              {r.passwordLabel}
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="new-password"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              placeholder={r.passwordPlaceholder}
            />
          </div>

          <div>
            <label htmlFor="verificationCode" className="block text-sm font-medium text-gray-700 mb-1">
              {r.codeLabel}
            </label>
            <input
              id="verificationCode"
              name="verificationCode"
              type="text"
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 font-mono tracking-widest"
              placeholder="XXXX-XXXX"
            />
            <p className="text-xs text-gray-400 mt-1">{r.codeHint}</p>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-sky-500 hover:bg-sky-600 disabled:opacity-60 text-white font-semibold py-2.5 rounded-lg transition"
          >
            {isPending ? r.submitting : r.submit}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          {r.hasAccount}{' '}
          <Link href="/login" className="text-sky-600 font-medium hover:underline">
            {r.loginLink}
          </Link>
        </p>
      </div>
    </main>
  )
}
