import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) redirect('/profile')

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 bg-gradient-to-br from-blue-600 to-indigo-800">
      <div className="w-full max-w-md text-center text-white">
        <div className="mb-8">
          <div className="text-6xl mb-4">🇩🇪</div>
          <h1 className="text-4xl font-bold mb-2">Deutsch Trainer</h1>
          <p className="text-blue-200 text-lg">VTŠ Subotica — Učenje nemačkog</p>
        </div>

        <div className="bg-white/10 backdrop-blur rounded-2xl p-6 mb-6 text-left">
          <h2 className="text-lg font-semibold mb-3">Šta možeš da naučiš?</h2>
          <ul className="space-y-2 text-blue-100">
            <li className="flex items-center gap-2">
              <span>✏️</span> Konjugacija glagola — sva 6 lica
            </li>
            <li className="flex items-center gap-2">
              <span>🎯</span> Popuni prazninu u rečenici
            </li>
            <li className="flex items-center gap-2">
              <span>🔗</span> Poveži parove — infinitiv i konjugacija
            </li>
            <li className="flex items-center gap-2">
              <span>🔊</span> Audio izgovor (Web Speech)
            </li>
            <li className="flex items-center gap-2">
              <span>🏆</span> Leaderboard i Day Streak
            </li>
          </ul>
        </div>

        <div className="flex flex-col gap-3">
          <Link
            href="/login"
            className="w-full bg-white text-blue-700 font-bold py-3 rounded-xl hover:bg-blue-50 transition"
          >
            Prijavi se
          </Link>
          <Link
            href="/register"
            className="w-full border border-white/50 text-white font-semibold py-3 rounded-xl hover:bg-white/10 transition"
          >
            Registruj se (sa kodom)
          </Link>
        </div>

        <p className="mt-6 text-blue-300 text-sm">
          Lekcije 1–13 · Glagoli · Vežbe · Statistike
        </p>
      </div>
    </main>
  )
}
