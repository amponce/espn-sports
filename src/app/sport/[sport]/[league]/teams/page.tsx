import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getTeams, SPORTS_CONFIG, SportKey, getTeamLogo } from '@/lib/espn-api';

interface Props {
  params: Promise<{ sport: string; league: string }>;
}

export default async function TeamsPage({ params }: Props) {
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

  let teamsData;
  try {
    teamsData = await getTeams(sport, league);
  } catch (error) {
    console.error('Failed to fetch teams:', error);
    teamsData = { sports: [] };
  }

  const teams = teamsData.sports?.[0]?.leagues?.[0]?.teams || [];

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
            <span className="text-4xl">{sportConfig.icon}</span>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{leagueConfig.name} Teams</h1>
              <p className="text-neutral-500 text-sm">{teams.length} teams</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Navigation tabs */}
        <div className="tab-nav mb-6">
          <Link href={`/sport/${sport}/${league}`} className="tab-item">
            Scores
          </Link>
          <Link href={`/sport/${sport}/${league}/teams`} className="tab-item active">
            Teams
          </Link>
          <Link href={`/sport/${sport}/${league}/news`} className="tab-item">
            News
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {teams.map(({ team }) => (
            <Link
              key={team.id}
              href={`/sport/${sport}/${league}/teams/${team.id}`}
              className="bg-neutral-900 hover:bg-neutral-800 rounded-lg p-4 transition-all border border-neutral-800 hover:border-neutral-700 text-center group"
              style={{
                borderBottomColor: team.color ? `#${team.color}` : undefined,
                borderBottomWidth: team.color ? '3px' : undefined,
              }}
            >
              <img
                src={getTeamLogo(team)}
                alt={team.displayName}
                className="w-16 h-16 object-contain mx-auto mb-3"
              />
              <h3 className="font-semibold text-sm group-hover:text-white transition-colors">
                {team.shortDisplayName || team.displayName}
              </h3>
              <p className="text-neutral-500 text-xs mt-1">{team.abbreviation}</p>
              {team.record?.items?.[0] && (
                <p className="text-neutral-400 text-xs mt-1">{team.record.items[0].summary}</p>
              )}
            </Link>
          ))}
        </div>

        {teams.length === 0 && (
          <div className="text-center py-16 text-neutral-500">
            <p className="text-lg">No teams found for this league</p>
          </div>
        )}
      </div>
    </main>
  );
}
