import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) redirect('/profile')

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 bg-gradient-to-br from-sky-500 to-sky-700">
      <div className="w-full max-w-md text-center text-white">
        <div className="mb-8">
          <div className="flex justify-center mb-5">
            <div className="bg-white rounded-2xl px-6 py-4">
              <Image src="/vts-transparent.png" alt="VTŠ Subotica" width={140} height={70} priority />
            </div>
          </div>
          <h1 className="text-3xl font-bold mb-1">Deutsch Trainer</h1>
          <p className="text-sky-100 text-base">VTŠ Subotica — Učenje nemačkog jezika</p>
        </div>

        <div className="bg-white/15 backdrop-blur rounded-2xl p-6 mb-6 text-left">
          <h2 className="text-base font-semibold mb-3">Šta možeš da naučiš?</h2>
          <ul className="space-y-2 text-sky-100 text-sm">
            <li className="flex items-center gap-2"><span>🔗</span> Poveži parove — infinitiv i konjugacija</li>
            <li className="flex items-center gap-2"><span>✏️</span> Konjugacija glagola — sva 6 lica</li>
            <li className="flex items-center gap-2"><span>📝</span> Popuni prazninu u rečenici</li>
            <li className="flex items-center gap-2"><span>🟣</span> Perfekt — haben/sein i Partizip II</li>
            <li className="flex items-center gap-2"><span>🏆</span> Leaderboard i Day Streak</li>
          </ul>
        </div>

        <div className="flex flex-col gap-3">
          <Link
            href="/login"
            className="w-full bg-white text-sky-600 font-bold py-3 rounded-xl hover:bg-sky-50 transition"
          >
            Prijavi se
          </Link>
          <Link
            href="/register"
            className="w-full border border-white/50 text-white font-semibold py-3 rounded-xl hover:bg-white/15 transition"
          >
            Registruj se (sa kodom)
          </Link>
        </div>

        <p className="mt-6 text-sky-200 text-xs">
          Lekcije 1–12 · 171 glagol · Präsens & Perfekt
        </p>
      </div>
    </main>
  )
}
