import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getScoreboard, SPORTS_CONFIG, SportKey, getTeamLogo, formatGameTime, isGameLive, Game } from '@/lib/espn-api';
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
    scoreboard = { events: [], leagues: [], calendar: [] };
  }

  // Extract game dates from calendar for smart navigation
  const gameDates = scoreboard.leagues?.[0]?.calendar || scoreboard.calendar || [];

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
    <main className="min-h-screen bg-gray-900 text-white">
      <header className="bg-gradient-to-r from-red-700 to-red-900 py-6 px-4">
        <div className="max-w-7xl mx-auto">
          <Link href={`/sport/${sport}`} className="text-red-200 hover:text-white text-sm mb-2 inline-block">
            &larr; Back to {sportConfig.name}
          </Link>
          <div className="flex items-center gap-4">
            {leagueLogos[league] ? (
              <img
                src={leagueLogos[league]}
                alt={leagueConfig.name}
                className="w-16 h-16 object-contain"
              />
            ) : (
              <div className="w-16 h-16 bg-gray-700 rounded-lg flex items-center justify-center text-2xl font-bold">
                {leagueConfig.name.slice(0, 3)}
              </div>
            )}
            <div>
              <h1 className="text-4xl font-bold">{leagueConfig.name}</h1>
              <p className="text-red-200">Scoreboard</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Navigation tabs */}
        <div className="flex gap-4 mb-8 border-b border-gray-700">
          <Link
            href={`/sport/${sport}/${league}`}
            className="pb-2 px-4 border-b-2 border-red-500 text-white font-semibold"
          >
            Scoreboard
          </Link>
          <Link
            href={`/sport/${sport}/${league}/teams`}
            className="pb-2 px-4 border-b-2 border-transparent text-gray-400 hover:text-white"
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
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
              Live Now
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {liveGames.map((game) => (
                <GameCard key={game.id} game={game} sport={sport} league={league} isLive />
              ))}
            </div>
          </section>
        )}

        {/* Upcoming Games */}
        {upcomingGames.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xl font-bold mb-4">Upcoming</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {upcomingGames.map((game) => (
                <GameCard key={game.id} game={game} sport={sport} league={league} />
              ))}
            </div>
          </section>
        )}

        {/* Completed Games */}
        {completedGames.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xl font-bold mb-4">Final</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {completedGames.map((game) => (
                <GameCard key={game.id} game={game} sport={sport} league={league} />
              ))}
            </div>
          </section>
        )}

        {scoreboard.events.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <p className="text-xl">No games scheduled for this date</p>
            <p className="mt-2">Try selecting a different date</p>
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
      className={`bg-gray-800 hover:bg-gray-700 rounded-lg p-4 transition-all ${
        isLive ? 'ring-2 ring-red-500' : ''
      }`}
    >
      <div className="flex justify-between items-start mb-3">
        <div className="text-sm text-gray-400">
          {isLive ? (
            <span className="text-red-400 font-semibold">
              {status.type.shortDetail}
            </span>
          ) : status.type.state === 'post' ? (
            <span>Final</span>
          ) : (
            <span>{formatGameTime(game.date)}</span>
          )}
        </div>
        {broadcasts.length > 0 && (
          <div className="text-xs text-gray-500">
            {broadcasts.join(', ')}
          </div>
        )}
      </div>

      {/* Away Team */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          {awayTeam?.team.logo && (
            <img
              src={getTeamLogo(awayTeam.team)}
              alt={awayTeam.team.displayName}
              className="w-8 h-8 object-contain"
            />
          )}
          <div>
            <span className={`font-semibold ${awayTeam?.winner ? 'text-white' : 'text-gray-300'}`}>
              {awayTeam?.team.shortDisplayName || awayTeam?.team.displayName}
            </span>
            {awayTeam?.records?.[0] && (
              <span className="text-gray-500 text-sm ml-2">
                ({awayTeam.records[0].summary})
              </span>
            )}
          </div>
        </div>
        <span className={`text-xl font-bold ${awayTeam?.winner ? 'text-white' : 'text-gray-400'}`}>
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
            <span className={`font-semibold ${homeTeam?.winner ? 'text-white' : 'text-gray-300'}`}>
              {homeTeam?.team.shortDisplayName || homeTeam?.team.displayName}
            </span>
            {homeTeam?.records?.[0] && (
              <span className="text-gray-500 text-sm ml-2">
                ({homeTeam.records[0].summary})
              </span>
            )}
          </div>
        </div>
        <span className={`text-xl font-bold ${homeTeam?.winner ? 'text-white' : 'text-gray-400'}`}>
          {homeTeam?.score || '-'}
        </span>
      </div>

      {/* Game situation for football */}
      {isLive && competition.situation && (
        <div className="mt-3 pt-3 border-t border-gray-700 text-sm text-gray-400">
          {competition.situation.downDistanceText && (
            <div>{competition.situation.downDistanceText}</div>
          )}
          {competition.situation.lastPlay && (
            <div className="text-xs mt-1 text-gray-500">
              {competition.situation.lastPlay.text}
            </div>
          )}
        </div>
      )}

      {/* Venue info */}
      {competition.venue && status.type.state === 'pre' && (
        <div className="mt-3 pt-3 border-t border-gray-700 text-xs text-gray-500">
          {competition.venue.fullName}
          {competition.venue.address?.city && ` - ${competition.venue.address.city}`}
        </div>
      )}
    </Link>
  );
}
