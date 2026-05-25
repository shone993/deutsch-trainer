/**
 * Seed Word Order sentences from APLIKACIJA imenice.xlsx
 * - difficulty=3: Präsens sentences (for Word Order Präsens)
 * - difficulty=4: Perfekt sentences (for Word Order Perfekt)
 *
 * Run: npx tsx prisma/seed-wordorder.ts
 */
import 'dotenv/config'
import { config } from 'dotenv'
config({ path: '.env.local' })

import * as XLSX from 'xlsx'
import path from 'path'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../app/generated/prisma/client'

const adapter = new PrismaPg({ connectionString: process.env.DIRECT_URL ?? process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter } as never)

// Kolone u Excel fajlu
const COL_INFINITIV = 0
const COL_PRAESENS_SENTENCES = [13, 14, 15, 16, 17, 18, 19, 20, 21, 22]
const COL_PERFEKT_SENTENCES  = [26, 27, 28, 29, 30, 31, 32, 33, 34, 35]

function normalizeInfinitiv(raw: string): string[] {
  const s = raw.trim()
  // "freuen, sich" → ["sich freuen", "freuen"]
  if (s.includes(', sich')) {
    const base = s.replace(', sich', '').trim()
    return [`sich ${base}`, base]
  }
  return [s]
}

function cleanSentence(s: string): string {
  return s.trim().replace(/\s+/g, ' ')
}

async function main() {
  const filePath = path.resolve('C:/Users/inspira/Downloads/APLIKACIJA imenice.xlsx')
  const wb = XLSX.readFile(filePath)
  const ws = wb.Sheets['Sheet1']
  const rows = XLSX.utils.sheet_to_json<string[]>(ws, { header: 1, defval: '' })

  // Učitaj sve glagole iz baze (infinitiv → id)
  const dbVerbs = await prisma.verb.findMany({ select: { id: true, infinitiv: true } })
  const verbMap = new Map(dbVerbs.map(v => [v.infinitiv.toLowerCase(), v.id]))

  console.log(`DB glagola: ${dbVerbs.length}`)

  let addedPraesens = 0
  let addedPerfekt  = 0
  let skippedVerbs  = 0

  for (const row of rows) {
    const raw = String(row[COL_INFINITIV] || '').trim()
    if (!raw || raw === 'Infinitiv' || raw.match(/^\d+$/)) continue
    if (!row[1]) continue  // nema konjugacije → nije verb red

    // Pronađi glagol u bazi
    const candidates = normalizeInfinitiv(raw)
    let verbId: string | undefined
    for (const c of candidates) {
      verbId = verbMap.get(c.toLowerCase())
      if (verbId) break
    }

    if (!verbId) {
      skippedVerbs++
      console.warn(`  SKIP (nije u DB): "${raw}"`)
      continue
    }

    // Präsens rečenice → difficulty=3
    for (const col of COL_PRAESENS_SENTENCES) {
      const sent = cleanSentence(String(row[col] || ''))
      if (!sent) continue
      await prisma.sentence.upsert({
        where: {
          // Nema uniqueness na (verbId, template) — koristimo create+skip pattern
          id: `wo3-${verbId}-${col}`,
        },
        update: {},
        create: {
          id: `wo3-${verbId}-${col}`,
          verbId,
          template: sent,
          translation: '',
          difficulty: 3,
          isActive: true,
        },
      })
      addedPraesens++
    }

    // Perfekt rečenice → difficulty=4
    for (const col of COL_PERFEKT_SENTENCES) {
      const sent = cleanSentence(String(row[col] || ''))
      if (!sent) continue
      await prisma.sentence.upsert({
        where: { id: `wo4-${verbId}-${col}` },
        update: {},
        create: {
          id: `wo4-${verbId}-${col}`,
          verbId,
          template: sent,
          translation: '',
          difficulty: 4,
          isActive: true,
        },
      })
      addedPerfekt++
    }
  }

  console.log(`\n✅ Gotovo!`)
  console.log(`   Präsens Word Order rečenica: ${addedPraesens}`)
  console.log(`   Perfekt  Word Order rečenica: ${addedPerfekt}`)
  console.log(`   Preskočeni glagoli (nisu u DB): ${skippedVerbs}`)
  await prisma.$disconnect()
}

main().catch(e => { console.error(e); process.exit(1) })
