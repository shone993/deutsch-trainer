'use client'

export default function StudentError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
      <div className="bg-white rounded-xl border border-red-200 p-6 max-w-lg w-full">
        <h2 className="font-bold text-red-700 text-lg mb-2">Greška na strani</h2>
        <pre className="text-xs text-gray-700 bg-gray-100 rounded p-3 overflow-auto whitespace-pre-wrap mb-4">
          {error.message}
          {'\n\nDigest: '}
          {error.digest}
        </pre>
        <button
          onClick={reset}
          className="bg-sky-500 text-white px-4 py-2 rounded-lg text-sm"
        >
          Pokušaj ponovo
        </button>
      </div>
    </main>
  )
}
