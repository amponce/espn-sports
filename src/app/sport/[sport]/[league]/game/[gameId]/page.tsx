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

  let gameSummary;
  try {
    gameSummary = await getGameSummary(sport, league, gameId);
  } catch (error) {
    console.error('Failed to fetch game summary:', error);
    notFound();
  }

  const header = gameSummary.header;
  const competition = header?.competitions?.[0];
  const homeCompetitor = competition?.competitors.find((c) => c.homeAway === 'home');
  const awayCompetitor = competition?.competitors.find((c) => c.homeAway === 'away');
  const status = competition?.status;

  const isLive = status?.type?.state === 'in';
  const isCompleted = status?.type?.completed;

  return (
    <main className="min-h-screen bg-gray-900 text-white">
      <header className="bg-gradient-to-r from-red-700 to-red-900 py-6 px-4">
        <div className="max-w-7xl mx-auto">
          <Link
            href={`/sport/${sport}/${league}`}
            className="text-red-200 hover:text-white text-sm mb-2 inline-block"
          >
            &larr; Back to {leagueConfig.name} Scoreboard
          </Link>

          {competition && homeCompetitor && awayCompetitor && (
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
                        {awayCompetitor.linescores?.map((_, i) => (
                          <th key={i} className="px-4 py-2">{i + 1}</th>
                        ))}
                        <th className="px-4 py-2">T</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className={awayCompetitor.winner ? 'font-bold' : ''}>
                        <td className="px-4 py-2 text-left">{awayCompetitor.team.abbreviation}</td>
                        {awayCompetitor.linescores?.map((ls, i) => (
                          <td key={i} className="px-4 py-2">{ls.displayValue}</td>
                        ))}
                        <td className="px-4 py-2">{awayCompetitor.score}</td>
                      </tr>
                      <tr className={homeCompetitor.winner ? 'font-bold' : ''}>
                        <td className="px-4 py-2 text-left">{homeCompetitor.team.abbreviation}</td>
                        {homeCompetitor.linescores?.map((ls, i) => (
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
