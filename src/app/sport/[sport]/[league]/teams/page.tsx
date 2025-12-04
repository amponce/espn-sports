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
    <main className="min-h-screen bg-gray-900 text-white">
      <header className="bg-gradient-to-r from-red-700 to-red-900 py-6 px-4">
        <div className="max-w-7xl mx-auto">
          <Link href={`/sport/${sport}/${league}`} className="text-red-200 hover:text-white text-sm mb-2 inline-block">
            &larr; Back to {leagueConfig.name}
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-5xl">{sportConfig.icon}</span>
            <div>
              <h1 className="text-4xl font-bold">{leagueConfig.name} Teams</h1>
              <p className="text-red-200">{teams.length} teams</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Navigation tabs */}
        <div className="flex gap-4 mb-8 border-b border-gray-700">
          <Link
            href={`/sport/${sport}/${league}`}
            className="pb-2 px-4 border-b-2 border-transparent text-gray-400 hover:text-white"
          >
            Scoreboard
          </Link>
          <Link
            href={`/sport/${sport}/${league}/teams`}
            className="pb-2 px-4 border-b-2 border-red-500 text-white font-semibold"
          >
            Teams
          </Link>
          <Link
            href={`/sport/${sport}/${league}/news`}
            className="pb-2 px-4 border-b-2 border-transparent text-gray-400 hover:text-white"
          >
            News
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {teams.map(({ team }) => (
            <Link
              key={team.id}
              href={`/sport/${sport}/${league}/teams/${team.id}`}
              className="bg-gray-800 hover:bg-gray-700 rounded-lg p-4 transition-all duration-200 hover:scale-105 text-center"
              style={{
                borderBottom: team.color ? `4px solid #${team.color}` : undefined,
              }}
            >
              <img
                src={getTeamLogo(team)}
                alt={team.displayName}
                className="w-16 h-16 object-contain mx-auto mb-3"
              />
              <h3 className="font-semibold text-sm">{team.shortDisplayName || team.displayName}</h3>
              <p className="text-gray-500 text-xs mt-1">{team.abbreviation}</p>
              {team.record?.items?.[0] && (
                <p className="text-gray-400 text-xs mt-1">{team.record.items[0].summary}</p>
              )}
            </Link>
          ))}
        </div>

        {teams.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <p>No teams found for this league</p>
          </div>
        )}
      </div>
    </main>
  );
}
