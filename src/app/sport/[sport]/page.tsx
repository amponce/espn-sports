import Link from 'next/link';
import { notFound } from 'next/navigation';
import { SPORTS_CONFIG, SportKey } from '@/lib/espn-api';
import { sportLogos, leagueLogos } from '@/lib/logos';

interface Props {
  params: Promise<{ sport: string }>;
}

export default async function SportPage({ params }: Props) {
  const { sport } = await params;

  if (!(sport in SPORTS_CONFIG)) {
    notFound();
  }

  const sportConfig = SPORTS_CONFIG[sport as SportKey];

  return (
    <main className="min-h-screen bg-black text-white">
      <header className="border-b border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Link href="/" className="text-neutral-500 hover:text-white text-xs mb-3 inline-flex items-center gap-1 transition-colors">
            <span>&larr;</span> All Sports
          </Link>
          <div className="flex items-center gap-4">
            {sportLogos[sport] ? (
              <img src={sportLogos[sport]} alt={sportConfig.name} className="w-12 h-12 object-contain" />
            ) : (
              <div className="w-12 h-12 bg-neutral-800 rounded-lg flex items-center justify-center text-lg font-bold text-neutral-400">
                {sportConfig.name.slice(0, 2).toUpperCase()}
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{sportConfig.name}</h1>
              <p className="text-neutral-500 text-sm">Select a league</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="section-header">Leagues</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {Object.entries(sportConfig.leagues).map(([leagueKey, league]) => (
            <Link
              key={leagueKey}
              href={`/sport/${sport}/${leagueKey}`}
              className="group bg-neutral-900 hover:bg-neutral-800 rounded-lg p-5 transition-all border border-neutral-800 hover:border-neutral-700 flex items-center gap-4"
            >
              {leagueLogos[leagueKey] ? (
                <img src={leagueLogos[leagueKey]} alt={league.name} className="w-10 h-10 object-contain opacity-80 group-hover:opacity-100 transition-opacity" />
              ) : (
                <div className="w-10 h-10 bg-neutral-800 rounded flex items-center justify-center text-sm font-bold text-neutral-500">
                  {league.name.slice(0, 3)}
                </div>
              )}
              <div>
                <h3 className="font-semibold text-sm group-hover:text-white transition-colors">{league.name}</h3>
                <p className="text-neutral-500 text-xs">View scoreboard</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}

export function generateStaticParams() {
  return Object.keys(SPORTS_CONFIG).map((sport) => ({
    sport,
  }));
}
