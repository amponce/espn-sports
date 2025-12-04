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
    <main className="min-h-screen bg-gray-900 text-white">
      <header className="bg-gradient-to-r from-red-700 to-red-900 py-6 px-4">
        <div className="max-w-7xl mx-auto">
          <Link href="/" className="text-red-200 hover:text-white text-sm mb-2 inline-block">
            &larr; Back to Sports
          </Link>
          <div className="flex items-center gap-4">
            {sportLogos[sport] ? (
              <img src={sportLogos[sport]} alt={sportConfig.name} className="w-16 h-16 object-contain" />
            ) : (
              <div className="w-16 h-16 bg-gray-700 rounded-lg flex items-center justify-center text-2xl font-bold">
                {sportConfig.name.slice(0, 2)}
              </div>
            )}
            <div>
              <h1 className="text-4xl font-bold">{sportConfig.name}</h1>
              <p className="text-red-200">Select a league to view scores and games</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-6 border-b border-gray-700 pb-2">Leagues</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {Object.entries(sportConfig.leagues).map(([leagueKey, league]) => (
            <Link
              key={leagueKey}
              href={`/sport/${sport}/${leagueKey}`}
              className="bg-gray-800 hover:bg-gray-700 rounded-lg p-6 transition-all duration-200 hover:scale-105 flex items-center gap-4"
            >
              {leagueLogos[leagueKey] ? (
                <img src={leagueLogos[leagueKey]} alt={league.name} className="w-12 h-12 object-contain" />
              ) : (
                <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center text-sm font-bold">
                  {league.name.slice(0, 3)}
                </div>
              )}
              <div>
                <h3 className="text-xl font-semibold">{league.name}</h3>
                <p className="text-gray-400 text-sm mt-1">View scoreboard &rarr;</p>
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
