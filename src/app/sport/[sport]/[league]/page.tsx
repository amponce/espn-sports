import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getScoreboard, SPORTS_CONFIG, SportKey, getTeamLogo, formatGameTime, Game } from '@/lib/espn-api';
import { ScoreboardClient } from './ScoreboardClient';
import { leagueLogos } from '@/lib/logos';

interface Props {
  params: Promise<{ sport: string; league: string }>;
  searchParams: Promise<{ date?: string }>;
}

export default async function LeaguePage({ params, searchParams }: Props) {
  const { sport, league } = await params;
  const { date } = await searchParams;

  if (!(sport in SPORTS_CONFIG)) {
    notFound();
  }

  const sportConfig = SPORTS_CONFIG[sport as SportKey];
  const leagueConfigRaw = sportConfig.leagues[league as keyof typeof sportConfig.leagues];

  if (!leagueConfigRaw) {
    notFound();
  }

  const leagueConfig = leagueConfigRaw as { name: string; slug: string };

  let scoreboard;
  try {
    scoreboard = await getScoreboard(sport, league, date);
  } catch (error) {
    console.error('Failed to fetch scoreboard:', error);
    scoreboard = { events: [], leagues: [] };
  }

  // Extract game dates from calendar for smart navigation
  const gameDates = scoreboard.leagues?.[0]?.calendar || [];

  const liveGames = scoreboard.events.filter((game) =>
    game.competitions[0]?.status?.type?.state === 'in'
  );

  const upcomingGames = scoreboard.events.filter((game) =>
    game.competitions[0]?.status?.type?.state === 'pre'
  );

  const completedGames = scoreboard.events.filter((game) =>
    game.competitions[0]?.status?.type?.state === 'post'
  );

  // Determine sport type for rendering
  const isGolf = sport === 'golf';
  const isMMA = sport === 'mma';

  return (
    <main className="min-h-screen bg-black text-white">
      {/* Modern header */}
      <header className="border-b border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Link href={`/sport/${sport}`} className="text-neutral-500 hover:text-white text-xs mb-3 inline-flex items-center gap-1 transition-colors">
            <span>&larr;</span> {sportConfig.name}
          </Link>
          <div className="flex items-center gap-4">
            {leagueLogos[league] ? (
              <img
                src={leagueLogos[league]}
                alt={leagueConfig.name}
                className="w-12 h-12 object-contain"
              />
            ) : (
              <div className="w-12 h-12 bg-neutral-800 rounded-lg flex items-center justify-center text-lg font-bold text-neutral-400">
                {leagueConfig.name.slice(0, 3)}
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{leagueConfig.name}</h1>
              <p className="text-neutral-500 text-sm">{isGolf ? 'Leaderboard' : 'Scoreboard'}</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Navigation tabs */}
        <div className="tab-nav mb-6">
          <Link
            href={`/sport/${sport}/${league}`}
            className="tab-item active"
          >
            {isGolf ? 'Leaderboard' : 'Scores'}
          </Link>
          {!isGolf && (
            <Link
              href={`/sport/${sport}/${league}/teams`}
              className="tab-item"
            >
              {isMMA ? 'Fighters' : 'Teams'}
            </Link>
          )}
          <Link
            href={`/sport/${sport}/${league}/news`}
            className="tab-item"
          >
            News
          </Link>
        </div>

        {/* Date selector */}
        <ScoreboardClient
          sport={sport}
          league={league}
          currentDate={date}
          gameDates={gameDates}
        />

        {/* Golf - Show as tournaments/leaderboards */}
        {isGolf && scoreboard.events.length > 0 && (
          <section className="mb-8">
            {scoreboard.events.map((event) => (
              <GolfTournamentCard key={event.id} event={event} sport={sport} league={league} />
            ))}
          </section>
        )}

        {/* MMA - Show as fight cards */}
        {isMMA && scoreboard.events.length > 0 && (
          <section className="mb-8">
            {scoreboard.events.map((event) => (
              <MMAEventCard key={event.id} event={event} sport={sport} league={league} />
            ))}
          </section>
        )}

        {/* Team Sports - Regular display */}
        {!isGolf && !isMMA && (
          <>
            {/* Live Games */}
            {liveGames.length > 0 && (
              <section className="mb-8">
                <h2 className="section-header flex items-center gap-2">
                  <span className="w-2 h-2 bg-red-500 rounded-full live-pulse"></span>
                  Live
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {liveGames.map((game) => (
                    <GameCard key={game.id} game={game} sport={sport} league={league} isLive />
                  ))}
                </div>
              </section>
            )}

            {/* Upcoming Games */}
            {upcomingGames.length > 0 && (
              <section className="mb-8">
                <h2 className="section-header">Upcoming</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {upcomingGames.map((game) => (
                    <GameCard key={game.id} game={game} sport={sport} league={league} />
                  ))}
                </div>
              </section>
            )}

            {/* Completed Games */}
            {completedGames.length > 0 && (
              <section className="mb-8">
                <h2 className="section-header">Final</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {completedGames.map((game) => (
                    <GameCard key={game.id} game={game} sport={sport} league={league} />
                  ))}
                </div>
              </section>
            )}
          </>
        )}

        {scoreboard.events.length === 0 && (
          <div className="text-center py-16 text-neutral-500">
            <p className="text-lg">No {isGolf ? 'tournaments' : isMMA ? 'events' : 'games'} scheduled</p>
            <p className="text-sm mt-2">Try selecting a different date</p>
          </div>
        )}
      </div>
    </main>
  );
}

// Golf Tournament Card - Shows leaderboard format
function GolfTournamentCard({ event, sport, league }: { event: Game; sport: string; league: string }) {
  const competition = event.competitions?.[0];
  const status = competition?.status;
  const isLive = status?.type?.state === 'in';
  const competitors = competition?.competitors || [];

  // Sort by score (handle golf scoring like "-6", "+2", "E")
  const sortedCompetitors = [...competitors].sort((a, b) => {
    const scoreA = parseGolfScore(a.score);
    const scoreB = parseGolfScore(b.score);
    return scoreA - scoreB;
  });

  const topCompetitors = sortedCompetitors.slice(0, 10);

  return (
    <div className={`bg-neutral-900 rounded-lg border ${isLive ? 'border-red-600/50' : 'border-neutral-800'}`}>
      {/* Tournament header */}
      <div className="flex justify-between items-center px-4 py-3 border-b border-neutral-800">
        <div>
          <h3 className="font-semibold">{event.name || event.shortName}</h3>
          <p className="text-neutral-500 text-xs mt-1">
            {status?.type?.shortDetail || status?.type?.description || formatGameTime(event.date)}
          </p>
        </div>
        {isLive && <span className="status-live">LIVE</span>}
      </div>

      {/* Leaderboard */}
      <div className="p-4">
        <div className="grid grid-cols-12 text-xs text-neutral-500 mb-2 px-2">
          <div className="col-span-1">POS</div>
          <div className="col-span-8">PLAYER</div>
          <div className="col-span-3 text-right">SCORE</div>
        </div>
        {topCompetitors.map((competitor, idx) => {
          const athlete = (competitor as any).athlete;
          return (
            <div
              key={athlete?.id || idx}
              className="grid grid-cols-12 items-center py-2 px-2 hover:bg-neutral-800 rounded text-sm"
            >
              <div className="col-span-1 text-neutral-500 font-medium">
                {idx + 1}
              </div>
              <div className="col-span-8 flex items-center gap-2">
                {athlete?.headshot?.href && (
                  <img src={athlete.headshot.href} alt="" className="w-6 h-6 rounded-full" />
                )}
                <span className="font-medium">{athlete?.displayName || 'Unknown'}</span>
                {athlete?.flag?.href && (
                  <img src={athlete.flag.href} alt="" className="w-4 h-3" />
                )}
              </div>
              <div className={`col-span-3 text-right font-semibold ${
                competitor.score?.startsWith('-') ? 'text-red-500' :
                competitor.score?.startsWith('+') ? 'text-neutral-400' : 'text-neutral-300'
              }`}>
                {competitor.score || 'E'}
              </div>
            </div>
          );
        })}
        {competitors.length > 10 && (
          <Link
            href={`/sport/${sport}/${league}/game/${event.id}`}
            className="block text-center text-sm text-red-500 hover:text-red-400 mt-4 py-2"
          >
            View full leaderboard ({competitors.length} players)
          </Link>
        )}
      </div>
    </div>
  );
}

// MMA Event Card - Shows fight card format
function MMAEventCard({ event, sport, league }: { event: Game; sport: string; league: string }) {
  const status = event.competitions?.[0]?.status;
  const isLive = status?.type?.state === 'in';
  const isCompleted = status?.type?.state === 'post';

  // MMA events have multiple competitions (fights)
  const fights = event.competitions || [];

  return (
    <div className={`bg-neutral-900 rounded-lg border ${isLive ? 'border-red-600/50' : 'border-neutral-800'}`}>
      {/* Event header */}
      <div className="flex justify-between items-center px-4 py-3 border-b border-neutral-800">
        <div>
          <h3 className="font-semibold">{event.name || event.shortName}</h3>
          <p className="text-neutral-500 text-xs mt-1">
            {status?.type?.shortDetail || formatGameTime(event.date)}
          </p>
        </div>
        {isLive && <span className="status-live">LIVE</span>}
        {isCompleted && <span className="status-final">Final</span>}
      </div>

      {/* Fight card */}
      <div className="p-4 space-y-3">
        {fights.map((fight, idx) => {
          const competitors = fight.competitors || [];
          const fighter1 = competitors[0];
          const fighter2 = competitors[1];
          const athlete1 = (fighter1 as any)?.athlete;
          const athlete2 = (fighter2 as any)?.athlete;

          return (
            <Link
              key={fight.id || idx}
              href={`/sport/${sport}/${league}/game/${event.id}`}
              className="block bg-neutral-800/50 hover:bg-neutral-800 rounded-lg p-3 transition-colors"
            >
              {/* Fight matchup */}
              <div className="flex items-center justify-between">
                {/* Fighter 1 */}
                <div className="flex items-center gap-3 flex-1">
                  {athlete1?.headshot?.href ? (
                    <img src={athlete1.headshot.href} alt="" className="w-10 h-10 rounded-full object-cover" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-neutral-700 flex items-center justify-center text-xs font-bold">
                      {(athlete1?.displayName || 'TBD').slice(0, 2).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <div className={`font-semibold text-sm ${fighter1?.winner ? 'text-green-500' : ''}`}>
                      {athlete1?.displayName || 'TBD'}
                    </div>
                    {(fighter1 as any)?.record && (
                      <div className="text-xs text-neutral-500">{(fighter1 as any).record}</div>
                    )}
                  </div>
                </div>

                {/* VS / Result */}
                <div className="px-4 text-center">
                  {fight.status?.type?.state === 'post' ? (
                    <div className="text-xs text-neutral-500">
                      {fight.status?.type?.shortDetail || 'Final'}
                    </div>
                  ) : (
                    <span className="text-neutral-600 font-bold">VS</span>
                  )}
                </div>

                {/* Fighter 2 */}
                <div className="flex items-center gap-3 flex-1 justify-end text-right">
                  <div>
                    <div className={`font-semibold text-sm ${fighter2?.winner ? 'text-green-500' : ''}`}>
                      {athlete2?.displayName || 'TBD'}
                    </div>
                    {(fighter2 as any)?.record && (
                      <div className="text-xs text-neutral-500">{(fighter2 as any).record}</div>
                    )}
                  </div>
                  {athlete2?.headshot?.href ? (
                    <img src={athlete2.headshot.href} alt="" className="w-10 h-10 rounded-full object-cover" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-neutral-700 flex items-center justify-center text-xs font-bold">
                      {(athlete2?.displayName || 'TBD').slice(0, 2).toUpperCase()}
                    </div>
                  )}
                </div>
              </div>

              {/* Weight class */}
              {(fight as any).type?.text && (
                <div className="text-xs text-neutral-500 text-center mt-2">
                  {(fight as any).type.text}
                </div>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

// Helper function to parse golf scores
function parseGolfScore(score: string | undefined): number {
  if (!score || score === 'E') return 0;
  if (score.startsWith('-')) return parseInt(score);
  if (score.startsWith('+')) return parseInt(score);
  return parseInt(score) || 999;
}

// Team Sports Game Card
function GameCard({ game, sport, league, isLive }: {
  game: Game;
  sport: string;
  league: string;
  isLive?: boolean;
}) {
  const competition = game.competitions[0];
  if (!competition) return null;

  const homeTeam = competition.competitors.find((c) => c.homeAway === 'home');
  const awayTeam = competition.competitors.find((c) => c.homeAway === 'away');
  const status = competition.status;
  const broadcasts = competition.broadcasts?.[0]?.names || [];

  return (
    <Link
      href={`/sport/${sport}/${league}/game/${game.id}`}
      className={`block bg-neutral-900 hover:bg-neutral-800 rounded-lg border transition-all ${
        isLive ? 'border-red-600/50 glow-red' : 'border-neutral-800 hover:border-neutral-700'
      }`}
    >
      {/* Game status bar */}
      <div className="flex justify-between items-center px-4 py-2 border-b border-neutral-800">
        <div className="text-xs">
          {isLive ? (
            <span className="status-live">{status.type.shortDetail}</span>
          ) : status.type.state === 'post' ? (
            <span className="status-final">Final</span>
          ) : (
            <span className="status-scheduled">{formatGameTime(game.date)}</span>
          )}
        </div>
        {broadcasts.length > 0 && (
          <div className="text-xs text-neutral-600">
            {broadcasts.join(', ')}
          </div>
        )}
      </div>

      <div className="p-4">
        {/* Away Team */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            {awayTeam?.team.logo && (
              <img
                src={getTeamLogo(awayTeam.team)}
                alt={awayTeam.team.displayName}
                className="w-8 h-8 object-contain"
              />
            )}
            <div>
              <span className={`team-name ${awayTeam?.winner ? 'text-white' : 'text-neutral-400'}`}>
                {awayTeam?.team.shortDisplayName || awayTeam?.team.displayName}
              </span>
              {awayTeam?.records?.[0] && (
                <span className="team-record ml-2">
                  {awayTeam.records[0].summary}
                </span>
              )}
            </div>
          </div>
          <span className={`score-medium ${awayTeam?.winner ? 'text-white' : 'text-neutral-500'}`}>
            {awayTeam?.score || '-'}
          </span>
        </div>

        {/* Home Team */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {homeTeam?.team.logo && (
              <img
                src={getTeamLogo(homeTeam.team)}
                alt={homeTeam.team.displayName}
                className="w-8 h-8 object-contain"
              />
            )}
            <div>
              <span className={`team-name ${homeTeam?.winner ? 'text-white' : 'text-neutral-400'}`}>
                {homeTeam?.team.shortDisplayName || homeTeam?.team.displayName}
              </span>
              {homeTeam?.records?.[0] && (
                <span className="team-record ml-2">
                  {homeTeam.records[0].summary}
                </span>
              )}
            </div>
          </div>
          <span className={`score-medium ${homeTeam?.winner ? 'text-white' : 'text-neutral-500'}`}>
            {homeTeam?.score || '-'}
          </span>
        </div>

        {/* Game situation for football */}
        {isLive && competition.situation && (
          <div className="mt-3 pt-3 border-t border-neutral-800 text-xs">
            {competition.situation.downDistanceText && (
              <div className="text-neutral-400">{competition.situation.downDistanceText}</div>
            )}
            {competition.situation.lastPlay && (
              <div className="text-neutral-600 mt-1 truncate">
                {competition.situation.lastPlay.text}
              </div>
            )}
          </div>
        )}

        {/* Venue info */}
        {competition.venue && status.type.state === 'pre' && (
          <div className="mt-3 pt-3 border-t border-neutral-800 text-xs text-neutral-600">
            {competition.venue.fullName}
            {competition.venue.address?.city && ` - ${competition.venue.address.city}`}
          </div>
        )}
      </div>
    </Link>
  );
}
