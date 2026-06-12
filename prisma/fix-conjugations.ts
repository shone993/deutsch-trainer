import { prisma } from '../lib/db/prisma'

// All fixes derived from checking actual DB values vs. correct German forms
const FIXES: Array<{ infinitiv: string; data: Partial<{ ich: string; du: string; erSieEs: string; wir: string; ihr: string; sieSie: string }> }> = [
  // anschließen — all forms except wir/sie were missing "an"
  { infinitiv: 'anschließen', data: { ich: 'schließe an', du: 'schließt an', erSieEs: 'schließt an', ihr: 'schließt an' } },

  // aussehen — all forms except wir/sie were missing "aus"; ihr had wrong stem (sieht→seht)
  { infinitiv: 'aussehen', data: { ich: 'sehe aus', du: 'siehst aus', erSieEs: 'sieht aus', ihr: 'seht aus' } },

  // einschenken — wir missing "ein"
  { infinitiv: 'einschenken', data: { wir: 'schenken ein' } },

  // eintragen — ihr had umlaut (trägt) but ihr-form doesn't take umlaut in German
  { infinitiv: 'eintragen', data: { ihr: 'tragt ein' } },

  // gefallen — ihr incorrectly had umlaut (gefällt→gefallt), only er/sie/es takes umlaut
  { infinitiv: 'gefallen', data: { ihr: 'gefallt' } },

  // wissen — er had "weißt" (du-form), ihr had "weißt" instead of "wisst"
  { infinitiv: 'wissen', data: { erSieEs: 'weiß', ihr: 'wisst' } },

  // treffen, sich — ihr had typo "such" instead of "euch"
  { infinitiv: 'treffen, sich', data: { ihr: 'trefft euch' } },

  // bedanken, sich — sie/Sie had "uns" (wir-form) instead of "sich"
  { infinitiv: 'bedanken, sich', data: { sieSie: 'bedanken sich' } },

  // interessieren, sich — er had typo "such" instead of "sich"
  { infinitiv: 'interessieren, sich', data: { erSieEs: 'interessiert sich' } },
]

async function main() {
  console.log('Fixing conjugation forms...\n')

  for (const fix of FIXES) {
    const verb = await prisma.verb.findFirst({ where: { infinitiv: fix.infinitiv } })
    if (!verb) {
      console.log(`  NOT FOUND: ${fix.infinitiv}`)
      continue
    }

    await prisma.verb.update({
      where: { id: verb.id },
      data: fix.data,
    })

    const changed = Object.entries(fix.data).map(([k, v]) => `${k}→"${v}"`).join(', ')
    console.log(`  ✓ ${fix.infinitiv}: ${changed}`)
  }

  console.log('\nDone.')
  await prisma.$disconnect()
}

main().catch(console.error)
