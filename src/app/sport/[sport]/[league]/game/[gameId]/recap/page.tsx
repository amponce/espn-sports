import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getGameSummary, SPORTS_CONFIG, SportKey, getTeamLogo } from '@/lib/espn-api';
import { extractGameRecapData } from '@/lib/rap-generator';
import { RecapClient } from './RecapClient';

interface Props {
  params: Promise<{ sport: string; league: string; gameId: string }>;
}

export default async function RecapPage({ params }: Props) {
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

  const recapData = extractGameRecapData(gameSummary);
  const header = gameSummary.header;
  const competition = header?.competitions?.[0];
  const homeCompetitor = competition?.competitors.find((c) => c.homeAway === 'home');
  const awayCompetitor = competition?.competitors.find((c) => c.homeAway === 'away');

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900/20 to-gray-900 text-white">
      <header className="py-6 px-4 bg-black/30">
        <div className="max-w-7xl mx-auto">
          <Link
            href={`/sport/${sport}/${league}/game/${gameId}`}
            className="text-purple-300 hover:text-white text-sm mb-2 inline-block"
          >
            &larr; Back to Game Details
          </Link>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                AI Rap Recap Generator
              </h1>
              <p className="text-gray-400 mt-1">Create a 60-second rap recap of the game</p>
            </div>
            <span className="text-4xl">{sportConfig.icon}</span>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Game Summary Card */}
        <div className="bg-gray-800/50 backdrop-blur rounded-xl p-6 mb-8 border border-purple-500/20">
          <div className="grid grid-cols-3 gap-4 items-center">
            {/* Away Team */}
            <div className="text-center">
              {awayCompetitor && (
                <>
                  <img
                    src={getTeamLogo(awayCompetitor.team)}
                    alt={awayCompetitor.team.displayName}
                    className="w-16 h-16 object-contain mx-auto mb-2"
                  />
                  <h3 className="font-bold">{awayCompetitor.team.displayName}</h3>
                </>
              )}
            </div>

            {/* Score */}
            <div className="text-center">
              <div className="text-4xl font-bold">
                <span className={awayCompetitor?.winner ? 'text-green-400' : ''}>
                  {awayCompetitor?.score || '0'}
                </span>
                <span className="text-gray-500 mx-3">-</span>
                <span className={homeCompetitor?.winner ? 'text-green-400' : ''}>
                  {homeCompetitor?.score || '0'}
                </span>
              </div>
              <p className="text-gray-400 text-sm mt-1">Final</p>
            </div>

            {/* Home Team */}
            <div className="text-center">
              {homeCompetitor && (
                <>
                  <img
                    src={getTeamLogo(homeCompetitor.team)}
                    alt={homeCompetitor.team.displayName}
                    className="w-16 h-16 object-contain mx-auto mb-2"
                  />
                  <h3 className="font-bold">{homeCompetitor.team.displayName}</h3>
                </>
              )}
            </div>
          </div>
        </div>

        <RecapClient recapData={recapData} gameId={gameId} gameSummary={gameSummary} />
      </div>
    </main>
  );
}
