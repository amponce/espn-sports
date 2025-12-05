import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getAthletes, SPORTS_CONFIG, SportKey } from '@/lib/espn-api';
import { leagueLogos } from '@/lib/logos';

interface Props {
  params: Promise<{ sport: string; league: string }>;
}

export default async function PlayersPage({ params }: Props) {
  const { sport, league } = await params;

  if (!(sport in SPORTS_CONFIG)) {
    notFound();
  }

  const sportConfig = SPORTS_CONFIG[sport as SportKey];
  const leagueConfigRaw = sportConfig.leagues[league as keyof typeof sportConfig.leagues];

  if (!leagueConfigRaw) {
    notFound();
  }

  const leagueConfig = leagueConfigRaw as { name: string; slug: string };

  let athletesData;
  try {
    athletesData = await getAthletes(sport, league, 200);
  } catch (error) {
    console.error('Failed to fetch athletes:', error);
    athletesData = { items: [] };
  }

  // Extract athletes from various response formats
  const athletes = athletesData.items ||
    athletesData.athletes ||
    athletesData.sports?.[0]?.leagues?.[0]?.athletes ||
    [];

  return (
    <main className="min-h-screen bg-black text-white">
      <header className="border-b border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Link
            href={`/sport/${sport}/${league}`}
            className="text-neutral-500 hover:text-white text-xs mb-3 inline-flex items-center gap-1 transition-colors"
          >
            <span>&larr;</span> Back to {leagueConfig.name}
          </Link>
          <div className="flex items-center gap-4">
            {leagueLogos[league] ? (
              <img src={leagueLogos[league]} alt={leagueConfig.name} className="w-12 h-12 object-contain" />
            ) : (
              <div className="w-12 h-12 bg-neutral-800 rounded-lg flex items-center justify-center text-lg font-bold text-neutral-400">
                {leagueConfig.name.slice(0, 3)}
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{leagueConfig.name} Players</h1>
              <p className="text-neutral-500 text-sm">{athletes.length} players</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Navigation tabs */}
        <div className="tab-nav mb-6">
          <Link href={`/sport/${sport}/${league}`} className="tab-item">
            Leaderboard
          </Link>
          <Link href={`/sport/${sport}/${league}/players`} className="tab-item active">
            Players
          </Link>
          <Link href={`/sport/${sport}/${league}/news`} className="tab-item">
            News
          </Link>
        </div>

        {/* Players Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {athletes.map((athlete: any) => (
            <Link
              key={athlete.id}
              href={`/sport/${sport}/${league}/players/${athlete.id}`}
              className="bg-neutral-900 hover:bg-neutral-800 rounded-lg p-4 transition-all border border-neutral-800 hover:border-neutral-700 text-center group"
            >
              {athlete.headshot?.href ? (
                <img
                  src={athlete.headshot.href}
                  alt={athlete.displayName}
                  className="w-20 h-20 object-cover mx-auto mb-3 rounded-full border-2 border-neutral-700 group-hover:border-green-600 transition-colors"
                />
              ) : (
                <div className="w-20 h-20 bg-neutral-800 rounded-full mx-auto mb-3 flex items-center justify-center text-xl font-bold text-neutral-500 border-2 border-neutral-700 group-hover:border-green-600 transition-colors">
                  {(athlete.displayName || '?').slice(0, 2).toUpperCase()}
                </div>
              )}
              <h3 className="font-semibold text-sm group-hover:text-white transition-colors">
                {athlete.displayName}
              </h3>
              {athlete.flag?.href && (
                <div className="mt-2 flex justify-center">
                  <img src={athlete.flag.href} alt="" className="w-5 h-3" />
                </div>
              )}
              {athlete.ranks?.[0] && (
                <p className="text-neutral-400 text-xs mt-1 font-medium">
                  Rank #{athlete.ranks[0].current?.value || athlete.ranks[0].value}
                </p>
              )}
            </Link>
          ))}
        </div>

        {athletes.length === 0 && (
          <div className="text-center py-16 text-neutral-500">
            <p className="text-lg">No players found</p>
            <p className="text-sm mt-2">Player data may not be available for this league</p>
          </div>
        )}
      </div>
    </main>
  );
}
