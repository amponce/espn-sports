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
              <p className="text-neutral-500 text-sm">Scoreboard</p>
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
            Scores
          </Link>
          <Link
            href={`/sport/${sport}/${league}/teams`}
            className="tab-item"
          >
            Teams
          </Link>
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

        {scoreboard.events.length === 0 && (
          <div className="text-center py-16 text-neutral-500">
            <p className="text-lg">No games scheduled for this date</p>
            <p className="text-sm mt-2">Try selecting a different date</p>
          </div>
        )}
      </div>
    </main>
  );
}

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
