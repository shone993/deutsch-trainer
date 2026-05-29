import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/db/prisma'

export const metadata = { title: 'Rečenice — Admin' }

export default async function AdminSentencesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { role: true },
  })
  if (!dbUser || dbUser.role !== 'ADMIN') redirect('/profile')

  const [sentences, verbs] = await Promise.all([
    prisma.sentence.findMany({
      orderBy: { verb: { lesson: 'asc' } },
      select: {
        id: true,
        template: true,
        translation: true,
        translationHu: true,
        difficulty: true,
        isActive: true,
        verb: { select: { infinitiv: true, lesson: true } },
      },
      take: 200,
    }),
    prisma.sentence.count(),
  ])

  const byLesson = new Map<number, typeof sentences>()
  for (const s of sentences) {
    const l = s.verb.lesson
    if (!byLesson.has(l)) byLesson.set(l, [])
    byLesson.get(l)!.push(s)
  }

  const lessonKeys = Array.from(byLesson.keys()).sort((a, b) => a - b)

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-indigo-700 text-white px-4 py-4 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto flex items-center gap-4">
          <Link href="/dashboard" className="text-indigo-300 hover:text-white text-sm shrink-0">
            ← Admin
          </Link>
          <div>
            <h1 className="font-bold text-lg leading-tight">Rečenice</h1>
            <p className="text-indigo-300 text-xs">{verbs} rečenica ukupno (prikazano prvih 200)</p>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-8">
        {lessonKeys.map(lesson => (
          <section key={lesson}>
            <h2 className="font-bold text-gray-800 mb-3">Lekcija {lesson}
              <span className="ml-2 text-sm font-normal text-gray-500">
                ({byLesson.get(lesson)!.length} rečenica)
              </span>
            </h2>
            <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
              {byLesson.get(lesson)!.map(s => (
                <div key={s.id} className="px-4 py-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="font-mono text-sm text-gray-800 break-all">{s.template}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{s.translation}</div>
                      {s.translationHu && (
                        <div className="text-xs text-gray-400">{s.translationHu}</div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs text-gray-400">{s.verb.infinitiv}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${s.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {s.isActive ? 'aktivan' : 'neaktivan'}
                      </span>
                      <span className="text-xs text-gray-400">T{s.difficulty}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  )
}
