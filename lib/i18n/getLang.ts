import { cookies } from 'next/headers'
import type { Lang } from './translations'

/** Čita jezik iz cookie-a (server komponente i server akcije) */
export async function getLang(): Promise<Lang> {
  const store = await cookies()
  const v = store.get('app-lang')?.value
  if (v === 'hu' || v === 'de') return v
  return 'sr'
}
