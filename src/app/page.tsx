import Link from 'next/link';
import { SPORTS_CONFIG } from '@/lib/espn-api';
import { sportLogos, leagueLogos } from '@/lib/logos';
import { Radio, Mic, Award, Trophy, Disc, Circle, Dribbble } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-900 text-white">
      <header className="bg-gradient-to-r from-red-700 to-red-900 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold">ESPN Sports Tracker</h1>
          <p className="text-red-200 mt-2">Real-time scores, stats, and historical games</p>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6 border-b border-gray-700 pb-2">Browse by Sport</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Object.entries(SPORTS_CONFIG).map(([sportKey, sport]) => (
              <Link
                key={sportKey}
                href={`/sport/${sportKey}`}
                className="bg-gray-800 hover:bg-gray-700 rounded-lg p-6 transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-red-900/20"
              >
                <div className="mb-3">
                  {sportLogos[sportKey] ? (
                    <img src={sportLogos[sportKey]} alt={sport.name} className="w-12 h-12 object-contain" />
                  ) : (
                    <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center text-lg font-bold">
                      {sport.name.slice(0, 2)}
                    </div>
                  )}
                </div>
                <h3 className="text-xl font-semibold">{sport.name}</h3>
                <p className="text-gray-400 text-sm mt-1">
                  {Object.keys(sport.leagues).length} league{Object.keys(sport.leagues).length > 1 ? 's' : ''}
                </p>
              </Link>
            ))}
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6 border-b border-gray-700 pb-2">Quick Links</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              href="/sport/football/nfl"
              className="bg-gradient-to-br from-blue-800 to-blue-900 hover:from-blue-700 hover:to-blue-800 rounded-lg p-4 transition-all flex items-center gap-3"
            >
              <img src={leagueLogos.nfl} alt="NFL" className="w-8 h-8 object-contain" />
              <span className="font-semibold">NFL Scoreboard</span>
            </Link>
            <Link
              href="/sport/basketball/nba"
              className="bg-gradient-to-br from-orange-700 to-orange-800 hover:from-orange-600 hover:to-orange-700 rounded-lg p-4 transition-all flex items-center gap-3"
            >
              <img src={leagueLogos.nba} alt="NBA" className="w-8 h-8 object-contain" />
              <span className="font-semibold">NBA Scoreboard</span>
            </Link>
            <Link
              href="/sport/baseball/mlb"
              className="bg-gradient-to-br from-red-800 to-red-900 hover:from-red-700 hover:to-red-800 rounded-lg p-4 transition-all flex items-center gap-3"
            >
              <img src={leagueLogos.mlb} alt="MLB" className="w-8 h-8 object-contain" />
              <span className="font-semibold">MLB Scoreboard</span>
            </Link>
            <Link
              href="/sport/hockey/nhl"
              className="bg-gradient-to-br from-cyan-800 to-cyan-900 hover:from-cyan-700 hover:to-cyan-800 rounded-lg p-4 transition-all flex items-center gap-3"
            >
              <img src={leagueLogos.nhl} alt="NHL" className="w-8 h-8 object-contain" />
              <span className="font-semibold">NHL Scoreboard</span>
            </Link>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6 border-b border-gray-700 pb-2">Historic Games</h2>
          <p className="text-gray-400 mb-4">Relive some of the greatest moments in sports history</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              href="/sport/basketball/nba/game/400878160"
              className="bg-gray-800 hover:bg-gray-700 rounded-lg p-4 transition-all border-l-4 border-yellow-500"
            >
              <div className="flex items-center gap-3">
                <Award className="w-8 h-8 text-yellow-500" />
                <div>
                  <h3 className="font-semibold">2016 NBA Finals Game 7</h3>
                  <p className="text-gray-400 text-sm">Cavaliers vs Warriors - One of the greatest games ever</p>
                </div>
              </div>
            </Link>
            <Link
              href="/sport/football/nfl/game/400999173"
              className="bg-gray-800 hover:bg-gray-700 rounded-lg p-4 transition-all border-l-4 border-blue-500"
            >
              <div className="flex items-center gap-3">
                <Trophy className="w-8 h-8 text-blue-400" />
                <div>
                  <h3 className="font-semibold">Super Bowl LI</h3>
                  <p className="text-gray-400 text-sm">Patriots vs Falcons - 28-3 Comeback</p>
                </div>
              </div>
            </Link>
            <Link
              href="/sport/football/nfl/game/401547417"
              className="bg-gray-800 hover:bg-gray-700 rounded-lg p-4 transition-all border-l-4 border-red-500"
            >
              <div className="flex items-center gap-3">
                <Trophy className="w-8 h-8 text-red-400" />
                <div>
                  <h3 className="font-semibold">Super Bowl LVII</h3>
                  <p className="text-gray-400 text-sm">Chiefs vs Eagles - 2023</p>
                </div>
              </div>
            </Link>
            <Link
              href="/sport/hockey/nhl/game/401559457"
              className="bg-gray-800 hover:bg-gray-700 rounded-lg p-4 transition-all border-l-4 border-cyan-500"
            >
              <div className="flex items-center gap-3">
                <Disc className="w-8 h-8 text-cyan-400" />
                <div>
                  <h3 className="font-semibold">2023 Stanley Cup Final Game 5</h3>
                  <p className="text-gray-400 text-sm">Golden Knights vs Panthers</p>
                </div>
              </div>
            </Link>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6 border-b border-gray-700 pb-2">Tools</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              href="/tools/streams"
              className="bg-gradient-to-br from-purple-800 to-purple-900 hover:from-purple-700 hover:to-purple-800 rounded-lg p-6 transition-all"
            >
              <Radio className="w-8 h-8 text-purple-300 mb-2" />
              <h3 className="text-xl font-semibold">Stream URL Tools</h3>
              <p className="text-purple-200 text-sm mt-2">
                Build, parse, and extract ESPN stream URLs for HLS players
              </p>
            </Link>
            <div className="bg-gray-800 rounded-lg p-6 opacity-75">
              <Mic className="w-8 h-8 text-gray-400 mb-2" />
              <h3 className="text-xl font-semibold">Rap Recap Generator</h3>
              <p className="text-gray-400 text-sm mt-2">
                Generate AI rap recaps from any completed game detail page
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-6 border-b border-gray-700 pb-2">API Information</h2>
          <div className="bg-gray-800 rounded-lg p-6">
            <p className="text-gray-300 mb-4">
              This app uses the ESPN public API to fetch real-time sports data. The API endpoints include:
            </p>
            <ul className="list-disc list-inside text-gray-400 space-y-2">
              <li>
                <code className="bg-gray-900 px-2 py-1 rounded text-green-400">
                  /apis/site/v2/sports/&#123;sport&#125;/&#123;league&#125;/scoreboard
                </code>
                {' '}- Live scores and schedules
              </li>
              <li>
                <code className="bg-gray-900 px-2 py-1 rounded text-green-400">
                  /apis/site/v2/sports/&#123;sport&#125;/&#123;league&#125;/summary?event=&#123;id&#125;
                </code>
                {' '}- Full game details, stats, play-by-play
              </li>
              <li>
                <code className="bg-gray-900 px-2 py-1 rounded text-green-400">
                  /apis/site/v2/sports/&#123;sport&#125;/&#123;league&#125;/teams
                </code>
                {' '}- Team information and rosters
              </li>
              <li>
                <code className="bg-gray-900 px-2 py-1 rounded text-green-400">
                  /apis/site/v2/sports/&#123;sport&#125;/&#123;league&#125;/news
                </code>
                {' '}- Latest news articles
              </li>
            </ul>
          </div>
        </section>
      </div>

      <footer className="bg-gray-800 mt-12 py-6 px-4">
        <div className="max-w-7xl mx-auto text-center text-gray-400">
          <p>Data provided by ESPN API. This is an unofficial application.</p>
        </div>
      </footer>
    </main>
  );
}
