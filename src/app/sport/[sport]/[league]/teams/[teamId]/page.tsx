import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getTeamInfo, getTeamSchedule, SPORTS_CONFIG, SportKey, getTeamLogo, formatGameTime } from '@/lib/espn-api';

interface Props {
  params: Promise<{ sport: string; league: string; teamId: string }>;
}

export default async function TeamPage({ params }: Props) {
  const { sport, league, teamId } = await params;

  if (!(sport in SPORTS_CONFIG)) {
    notFound();
  }

  const sportConfig = SPORTS_CONFIG[sport as SportKey];
  const leagueConfigRaw = sportConfig.leagues[league as keyof typeof sportConfig.leagues];

  if (!leagueConfigRaw) {
    notFound();
  }

  const leagueConfig = leagueConfigRaw as { name: string; slug: string };

  let teamInfo;
  let schedule;

  try {
    [teamInfo, schedule] = await Promise.all([
      getTeamInfo(sport, league, teamId),
      getTeamSchedule(sport, league, teamId).catch(() => null),
    ]);
  } catch (error) {
    console.error('Failed to fetch team info:', error);
    notFound();
  }

  const team = teamInfo.team;
  const events = (schedule as { events?: Array<{
    id: string;
    date: string;
    name: string;
    shortName: string;
    competitions: Array<{
      competitors: Array<{
        id: string;
        homeAway: string;
        winner?: boolean;
        score?: { displayValue: string };
        team: { displayName: string; logo?: string };
      }>;
      status: { type: { completed: boolean; description: string } };
    }>;
  }> })?.events || [];

  return (
    <main className="min-h-screen bg-gray-900 text-white">
      <header
        className="py-8 px-4"
        style={{
          background: team.color
            ? `linear-gradient(135deg, #${team.color} 0%, #${team.alternateColor || team.color} 100%)`
            : 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)',
        }}
      >
        <div className="max-w-7xl mx-auto">
          <Link
            href={`/sport/${sport}/${league}/teams`}
            className="text-white/70 hover:text-white text-sm mb-2 inline-block"
          >
            &larr; Back to {leagueConfig.name} Teams
          </Link>

          <div className="flex items-center gap-6 mt-4">
            <img
              src={getTeamLogo(team)}
              alt={team.displayName}
              className="w-24 h-24 object-contain"
            />
            <div>
              <h1 className="text-4xl font-bold">{team.displayName}</h1>
              {team.standingSummary && (
                <p className="text-white/80 text-lg mt-1">{team.standingSummary}</p>
              )}
              {team.record?.items && (
                <div className="flex gap-4 mt-2">
                  {team.record.items.map((record, i) => (
                    <span key={i} className="text-white/70">
                      {record.type}: {record.summary}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Next Game */}
        {team.nextEvent && team.nextEvent.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xl font-bold mb-4">Next Game</h2>
            <div className="bg-gray-800 rounded-lg p-4">
              {team.nextEvent.map((event) => (
                <Link
                  key={event.id}
                  href={`/sport/${sport}/${league}/game/${event.id}`}
                  className="block hover:bg-gray-700/50 rounded p-2 transition-colors"
                >
                  <div className="text-sm text-gray-400 mb-2">
                    {formatGameTime(event.date)}
                  </div>
                  <div className="font-semibold">{event.name}</div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Schedule */}
        {events.length > 0 && (
          <section>
            <h2 className="text-xl font-bold mb-4">Schedule</h2>
            <div className="space-y-2">
              {events.map((event) => {
                const competition = event.competitions?.[0];
                if (!competition) return null;

                const teamCompetitor = competition.competitors.find(
                  (c) => c.id === teamId
                );
                const opponent = competition.competitors.find(
                  (c) => c.id !== teamId
                );
                const isHome = teamCompetitor?.homeAway === 'home';
                const isCompleted = competition.status?.type?.completed;

                return (
                  <Link
                    key={event.id}
                    href={`/sport/${sport}/${league}/game/${event.id}`}
                    className={`bg-gray-800 hover:bg-gray-700 rounded-lg p-4 transition-all flex items-center justify-between ${
                      teamCompetitor?.winner
                        ? 'border-l-4 border-green-500'
                        : isCompleted && !teamCompetitor?.winner
                        ? 'border-l-4 border-red-500'
                        : ''
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-sm text-gray-400 w-24">
                        {new Date(event.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </div>
                      <div className="text-gray-400 w-8">{isHome ? 'vs' : '@'}</div>
                      <div className="flex items-center gap-3">
                        {opponent?.team?.logo && (
                          <img
                            src={opponent.team.logo}
                            alt=""
                            className="w-8 h-8 object-contain"
                          />
                        )}
                        <span className="font-semibold">
                          {opponent?.team?.displayName || 'TBD'}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      {isCompleted ? (
                        <div>
                          <span
                            className={`font-bold ${
                              teamCompetitor?.winner ? 'text-green-400' : 'text-red-400'
                            }`}
                          >
                            {teamCompetitor?.winner ? 'W' : 'L'}
                          </span>
                          <span className="text-gray-400 ml-2">
                            {typeof teamCompetitor?.score === 'object' ? teamCompetitor?.score?.displayValue : teamCompetitor?.score} -{' '}
                            {typeof opponent?.score === 'object' ? opponent?.score?.displayValue : opponent?.score}
                          </span>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">
                          {competition.status?.type?.description || 'Scheduled'}
                        </span>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* API Endpoint */}
        <section className="mt-8">
          <h2 className="text-xl font-bold mb-4">API Endpoints</h2>
          <div className="bg-gray-800 rounded-lg p-4 space-y-2">
            <div>
              <span className="text-gray-400">Team Info:</span>
              <code className="ml-2 text-green-400 text-sm">
                /apis/site/v2/sports/{sport}/{league}/teams/{teamId}
              </code>
            </div>
            <div>
              <span className="text-gray-400">Schedule:</span>
              <code className="ml-2 text-green-400 text-sm">
                /apis/site/v2/sports/{sport}/{league}/teams/{teamId}/schedule
              </code>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
