import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getGameSummary, SPORTS_CONFIG, SportKey, getTeamLogo, formatDate } from '@/lib/espn-api';
import { GameClient } from './GameClient';

interface Props {
  params: Promise<{ sport: string; league: string; gameId: string }>;
}

export default async function GamePage({ params }: Props) {
  const { sport, league, gameId } = await params;

  if (!(sport in SPORTS_CONFIG)) {
    notFound();
  }

  const sportConfig = SPORTS_CONFIG[sport as SportKey];
  const leagueConfigRaw = sportConfig.leagues[league as keyof typeof sportConfig.leagues];

  if (!leagueConfigRaw) {
    notFound();
  }

  const leagueConfig = leagueConfigRaw as { name: string; slug: string };

  // Check if this is MMA (uses athletes instead of teams)
  const isMMA = sport === 'mma';
  const isGolf = sport === 'golf';

  let gameSummary;
  let apiError = false;
  try {
    gameSummary = await getGameSummary(sport, league, gameId);
  } catch (error) {
    console.error('Failed to fetch game summary:', error);
    // For MMA/Golf, show a graceful message instead of 404
    if (isMMA || isGolf) {
      apiError = true;
      gameSummary = { header: null };
    } else {
      notFound();
    }
  }

  const header = gameSummary?.header;
  const competition = header?.competitions?.[0];
  const status = competition?.status;

  const isLive = status?.type?.state === 'in';
  const isCompleted = status?.type?.completed;

  // For team sports
  const homeCompetitor = competition?.competitors?.find((c: any) => c.homeAway === 'home');
  const awayCompetitor = competition?.competitors?.find((c: any) => c.homeAway === 'away');

  // For MMA - get fighters
  const competitors = competition?.competitors || [];
  const fighter1 = competitors[0];
  const fighter2 = competitors[1];

  // If API failed for MMA/Golf, show unavailable page
  if (apiError) {
    return (
      <main className="min-h-screen bg-black text-white">
        <header className="border-b border-neutral-800 py-6 px-4">
          <div className="max-w-7xl mx-auto">
            <Link
              href={`/sport/${sport}/${league}`}
              className="text-neutral-500 hover:text-white text-xs mb-3 inline-flex items-center gap-1 transition-colors"
            >
              <span>&larr;</span> Back to {leagueConfig.name}
            </Link>
            <h1 className="text-2xl font-bold tracking-tight mt-4">{leagueConfig.name}</h1>
          </div>
        </header>
        <div className="max-w-7xl mx-auto px-4 py-16 text-center">
          <div className="text-6xl mb-4">{isMMA ? '🥊' : '⛳'}</div>
          <h2 className="text-xl font-semibold mb-2">Event Details Not Available</h2>
          <p className="text-neutral-500 mb-6">
            Detailed event information is not available through the ESPN API for {isMMA ? 'UFC events' : 'golf tournaments'}.
          </p>
          <Link
            href={`/sport/${sport}/${league}`}
            className="btn-primary inline-block"
          >
            Back to {isMMA ? 'Events' : 'Leaderboard'}
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <header className="border-b border-neutral-800 py-6 px-4">
        <div className="max-w-7xl mx-auto">
          <Link
            href={`/sport/${sport}/${league}`}
            className="text-neutral-500 hover:text-white text-xs mb-3 inline-flex items-center gap-1 transition-colors"
          >
            <span>&larr;</span> Back to {leagueConfig.name}
          </Link>

          {/* MMA Event Header */}
          {isMMA && header?.competitions && header.competitions.length > 0 && (
            <div className="mt-4">
              <h1 className="text-2xl font-bold tracking-tight mb-2">
                {(gameSummary as any).header?.league?.name || 'UFC'} Event
              </h1>
              <p className="text-neutral-400 text-sm mb-6">
                {header.competitions.length} fights on this card
              </p>

              {/* Fight Card - All fights on the event */}
              <div className="space-y-4">
                {header.competitions.map((fight: any, index: number) => {
                  const fighter1 = fight.competitors?.[0];
                  const fighter2 = fight.competitors?.[1];
                  const fightStatus = fight.status;
                  const isMainEvent = index === 0;

                  return (
                    <div
                      key={fight.id || index}
                      className={`bg-neutral-900 rounded-lg p-4 border ${
                        isMainEvent ? 'border-red-500/50' : 'border-neutral-800'
                      }`}
                    >
                      {isMainEvent && (
                        <div className="text-red-500 text-xs font-semibold uppercase tracking-wider mb-2">
                          Main Event
                        </div>
                      )}

                      <div className="flex items-center justify-between gap-4">
                        {/* Fighter 1 */}
                        <div className="flex-1 text-center">
                          {fighter1?.athlete?.headshot?.href && (
                            <img
                              src={fighter1.athlete.headshot.href}
                              alt={fighter1.athlete?.displayName}
                              className="w-16 h-16 rounded-full object-cover mx-auto mb-2 bg-neutral-800"
                            />
                          )}
                          <div className="font-semibold text-sm">
                            {fighter1?.athlete?.displayName || 'TBD'}
                          </div>
                          {fighter1?.athlete?.flag?.href && (
                            <img
                              src={fighter1.athlete.flag.href}
                              alt=""
                              className="w-5 h-3 mx-auto mt-1"
                            />
                          )}
                          {fighter1?.winner && (
                            <span className="inline-block mt-1 bg-green-600 text-white text-xs px-2 py-0.5 rounded">
                              Winner
                            </span>
                          )}
                        </div>

                        {/* VS / Result */}
                        <div className="text-center px-4">
                          {fightStatus?.type?.completed ? (
                            <div>
                              <div className="text-neutral-500 text-xs mb-1">
                                {fightStatus.type?.shortDetail || 'Completed'}
                              </div>
                              <div className="text-lg font-bold text-neutral-400">
                                {fight.result?.shortDisplayName || 'Final'}
                              </div>
                            </div>
                          ) : fightStatus?.type?.state === 'in' ? (
                            <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold animate-pulse">
                              LIVE
                            </span>
                          ) : (
                            <span className="text-neutral-500 text-lg font-bold">VS</span>
                          )}
                        </div>

                        {/* Fighter 2 */}
                        <div className="flex-1 text-center">
                          {fighter2?.athlete?.headshot?.href && (
                            <img
                              src={fighter2.athlete.headshot.href}
                              alt={fighter2.athlete?.displayName}
                              className="w-16 h-16 rounded-full object-cover mx-auto mb-2 bg-neutral-800"
                            />
                          )}
                          <div className="font-semibold text-sm">
                            {fighter2?.athlete?.displayName || 'TBD'}
                          </div>
                          {fighter2?.athlete?.flag?.href && (
                            <img
                              src={fighter2.athlete.flag.href}
                              alt=""
                              className="w-5 h-3 mx-auto mt-1"
                            />
                          )}
                          {fighter2?.winner && (
                            <span className="inline-block mt-1 bg-green-600 text-white text-xs px-2 py-0.5 rounded">
                              Winner
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Fight type/weight class if available */}
                      {fight.type?.text && (
                        <div className="text-center text-neutral-500 text-xs mt-3">
                          {fight.type.text}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Team Sports Header */}
          {!isMMA && competition && homeCompetitor && awayCompetitor && (
            <div className="mt-4">
              {/* Game status */}
              <div className="flex items-center gap-2 mb-4">
                {isLive && (
                  <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold animate-pulse">
                    LIVE
                  </span>
                )}
                <span className="text-red-200">
                  {status?.type?.detail || formatDate(competition.date)}
                </span>
              </div>

              {/* Scoreboard */}
              <div className="grid grid-cols-3 gap-4 items-center">
                {/* Away Team */}
                <div className="text-center">
                  <Link href={`/sport/${sport}/${league}/teams/${awayCompetitor.team.id}`}>
                    <img
                      src={getTeamLogo(awayCompetitor.team)}
                      alt={awayCompetitor.team.displayName}
                      className="w-20 h-20 object-contain mx-auto mb-2"
                    />
                    <h2 className="text-xl font-bold">{awayCompetitor.team.displayName}</h2>
                    {awayCompetitor.record?.[0] && (
                      <p className="text-red-200 text-sm">{awayCompetitor.record[0].displayValue}</p>
                    )}
                  </Link>
                </div>

                {/* Score */}
                <div className="text-center">
                  <div className="text-5xl font-bold">
                    <span className={awayCompetitor.winner ? 'text-white' : 'text-gray-400'}>
                      {awayCompetitor.score || '0'}
                    </span>
                    <span className="text-gray-500 mx-4">-</span>
                    <span className={homeCompetitor.winner ? 'text-white' : 'text-gray-400'}>
                      {homeCompetitor.score || '0'}
                    </span>
                  </div>
                  {status && (
                    <p className="text-red-200 mt-2">{status.type.shortDetail}</p>
                  )}
                </div>

                {/* Home Team */}
                <div className="text-center">
                  <Link href={`/sport/${sport}/${league}/teams/${homeCompetitor.team.id}`}>
                    <img
                      src={getTeamLogo(homeCompetitor.team)}
                      alt={homeCompetitor.team.displayName}
                      className="w-20 h-20 object-contain mx-auto mb-2"
                    />
                    <h2 className="text-xl font-bold">{homeCompetitor.team.displayName}</h2>
                    {homeCompetitor.record?.[0] && (
                      <p className="text-red-200 text-sm">{homeCompetitor.record[0].displayValue}</p>
                    )}
                  </Link>
                </div>
              </div>

              {/* Line scores */}
              {(homeCompetitor.linescores?.length || awayCompetitor.linescores?.length) && (
                <div className="mt-6 overflow-x-auto">
                  <table className="w-full max-w-xl mx-auto text-center">
                    <thead>
                      <tr className="text-red-200 text-sm">
                        <th className="px-4 py-2 text-left">Team</th>
                        {awayCompetitor.linescores?.map((_: any, i: number) => (
                          <th key={i} className="px-4 py-2">{i + 1}</th>
                        ))}
                        <th className="px-4 py-2">T</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className={awayCompetitor.winner ? 'font-bold' : ''}>
                        <td className="px-4 py-2 text-left">{awayCompetitor.team.abbreviation}</td>
                        {awayCompetitor.linescores?.map((ls: any, i: number) => (
                          <td key={i} className="px-4 py-2">{ls.displayValue}</td>
                        ))}
                        <td className="px-4 py-2">{awayCompetitor.score}</td>
                      </tr>
                      <tr className={homeCompetitor.winner ? 'font-bold' : ''}>
                        <td className="px-4 py-2 text-left">{homeCompetitor.team.abbreviation}</td>
                        {homeCompetitor.linescores?.map((ls: any, i: number) => (
                          <td key={i} className="px-4 py-2">{ls.displayValue}</td>
                        ))}
                        <td className="px-4 py-2">{homeCompetitor.score}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Fallback for missing data */}
          {!competition && (
            <div className="mt-4 text-center text-red-200">
              <p>Event details not available</p>
            </div>
          )}
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <GameClient
          sport={sport}
          league={league}
          gameId={gameId}
          isLive={isLive}
          gameSummary={gameSummary}
        />
      </div>
    </main>
  );
}
