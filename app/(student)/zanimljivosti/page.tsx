import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export const metadata = { title: 'Zanimljivosti — Deutsch Trainer' }

interface Fact { emoji: string; title: string; body: string }

const GERMANY: Fact[] = [
  { emoji: '📚', title: 'Štamparska mašina', body: 'Johan Gutenberg je u Mainzu oko 1450. godine izumeo štamparsku mašinu sa pokretnim slovima — jedan od najvažnijih izuma u istoriji čovečanstva.' },
  { emoji: '🍺', title: 'Zemlja piva', body: 'Nemačka ima više od 1.500 pivara i pravi oko 5.000 različitih vrsti piva. Na čuvenom Oktoberfestu u Minhenu svake godine se popije više od 6 miliona litara!' },
  { emoji: '🚗', title: 'Autobahn bez ograničenja', body: 'Neke deonice nemačkog autoputa (Autobahn) nemaju zakonsko ograničenje brzine. Preporučena brzina je 130 km/h, ali mnogi voze i 200+ km/h.' },
  { emoji: '🏰', title: 'Dvorci i zamkovi', body: 'Nemačka ima više od 20.000 dvoraca, zamkova i tvrđava — više nego bilo koja druga zemlja na svetu. Najpoznatiji je Neuschwanstein u Bavariji.' },
  { emoji: '🎄', title: 'Tradicija Božića', body: 'Mnoge božićne tradicije potiču iz Nemačke: ukrašena jelka (Weihnachtsbaum), adventski venac, adventski kalendar i vašari (Weihnachtsmarkt).' },
  { emoji: '🎶', title: 'Zemlja muzike', body: 'Nemačka je rodila najveće klasične kompozitore: Johann Sebastian Bach, Ludwig van Beethoven, Johannes Brahms, Richard Wagner i Georg Friedrich Händel.' },
]

const AUSTRIA: Fact[] = [
  { emoji: '🎹', title: 'Mozart i Salzburg', body: 'Wolfgang Amadeus Mozart je rođen u Salzburgu 1756. godine. Grad je danas posvećen njegovom nasleđu — festival, čokolade, pa čak i slatkiši nose njegovo ime.' },
  { emoji: '☕', title: 'Bečka kafe kultura', body: 'Bečke kafane (Wiener Kaffeehäuser) su na UNESCO listi nematerijalne kulturne baštine. Bečka kafa je poseban rituał — dolazi se da se sedi, čita, razgovara.' },
  { emoji: '🎂', title: 'Sachertorte', body: 'Čuvena čokoladna torta Sachertorte izmišljena je 1832. u Beču. Između hotela Sacher i slastičarnice Demel postoji dugogodinji spor oko originalne recepture.' },
  { emoji: '🎭', title: 'Prestonica kulture', body: 'Beč je bio prestonica Austrougarskog carstva i centar evropske kulture. Bečka opera, muzej istorije umetnosti i Kunsthistorisches Museum privlače milione posetilaca.' },
  { emoji: '⛷️', title: 'Skijaška velesila', body: 'Austrija je jedna od vodećih svetskih skijaških nacija. Alpski ski spust je razvijen upravo ovde, a Hahnenkamm u Kitzbühelu je najtradicionalnija i najopasnija ski trka na svetu.' },
]

const SWITZERLAND: Fact[] = [
  { emoji: '🍫', title: 'Mlečna čokolada', body: 'Daniel Peter je 1875. u Veveyju izmislio mlečnu čokoladu dodajući mleko u prahu Henrija Nestléa u čokoladnu masu. Švajcarska je od tada svetska prestonica čokolade.' },
  { emoji: '🗣️', title: 'Četiri zvanična jezika', body: 'Švajcarska ima 4 zvanična jezika: nemački (63%), francuski (23%), italijanski (8%) i romanš (1%). Na novčanicama piše "Helvetia" — latinski naziv, neutralan prema svim jezicima.' },
  { emoji: '🕊️', title: 'Večita neutralnost', body: 'Švajcarska je neutralna zemlja od 1815. godine i nije učestvovala ni u jednom svetskom ratu. Ženeva je dom brojnih međunarodnih organizacija — UN, Crveni krst, WHO.' },
  { emoji: '⌚', title: 'Satovi i bankarstvo', body: 'Švajcarska proizvodi oko 60% svih luksuznih satova na svetu. Zajedno sa bankarskim sektorom, to čini dva stuba švajcarske ekonomije poznatih po preciznosti i pouzdanosti.' },
  { emoji: '🏔️', title: 'Alpska zemlja', body: 'Više od 60% Švajcarske pokrivaju Alpe. Matterhorn (4.478 m) je jedan od najprepoznatljivijih planinskih vrhova na svetu. U Švajcarskoj ima više od 1.500 jezera.' },
]

const LANGUAGE: Fact[] = [
  { emoji: '🔤', title: 'Najduže reči', body: 'Nemački jezik je poznat po dugačkim složenicama. Najduža zvanično registrovana reč je "Rindfleischetikettierungsüberwachungsaufgabenübertragungsgesetz" (63 slova) — zakon o kontroli označavanja goveđeg mesa.' },
  { emoji: '🌍', title: 'Nemačke reči u svetu', body: 'Mnoge nemačke reči ušle su u engleski: Wanderlust (žudnja za putovanjem), Schadenfreude (zadovoljstvo zbog tuđe nesreće), Zeitgeist (duh vremena), Kindergarten, Angst, Hamburger...' },
  { emoji: '📝', title: 'Velika slova za imenice', body: 'Nemački je jedan od retkih živih jezika u kojima se SVE imenice pišu velikim slovom. "Das Buch" (knjiga), "die Schule" (škola) — ovo pravilo važi od 17. veka.' },
  { emoji: '🔢', title: 'Broj govornika', body: 'Nemački je maternji jezik za oko 100 miliona ljudi i službeni jezik u 6 zemalja: Nemačka, Austrija, Švajcarska, Luksemburg, Lihtenštajn i Belgija. U EU je najrasprostranjeniji maternji jezik.' },
  { emoji: '📖', title: 'Nivo A1–C2', body: 'Goethe-Institut deli znanje nemačkog na 6 nivoa (A1, A2, B1, B2, C1, C2). Na nivou B2 može se studirati na nemačkim univerzitetima, a studije su često besplatne ili uz minimalnu školarinu.' },
]

interface SectionProps { title: string; flag: string; color: string; facts: Fact[] }

function Section({ title, flag, color, facts }: SectionProps) {
  return (
    <section>
      <h2 className={`text-lg font-bold mb-4 flex items-center gap-2 ${color}`}>
        <span>{flag}</span> {title}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {facts.map((f, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 flex gap-3">
            <span className="text-2xl shrink-0 mt-0.5">{f.emoji}</span>
            <div>
              <div className="font-semibold text-gray-900 text-sm mb-1">{f.title}</div>
              <div className="text-gray-600 text-sm leading-relaxed">{f.body}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export default async function ZanimljivostiPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-sky-500 text-white px-4 py-4 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <Link href="/profile" className="text-sky-200 hover:text-white text-sm">← Nazad</Link>
          <div>
            <h1 className="font-bold text-lg leading-tight">Zanimljivosti</h1>
            <p className="text-sky-100 text-xs">Nemačko govorno područje</p>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-10">
        <Section title="Nemačka"   flag="🇩🇪" color="text-gray-800" facts={GERMANY}   />
        <Section title="Austrija"  flag="🇦🇹" color="text-red-700"  facts={AUSTRIA}   />
        <Section title="Švajcarska" flag="🇨🇭" color="text-red-600"  facts={SWITZERLAND} />
        <Section title="Nemački jezik" flag="🗣️" color="text-sky-700" facts={LANGUAGE} />
      </div>
    </main>
  )
}
