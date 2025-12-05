import Link from 'next/link';
import { SPORTS_CONFIG } from '@/lib/espn-api';
import { sportLogos, leagueLogos } from '@/lib/logos';

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white">
      {/* Modern header */}
      <header className="border-b border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center font-bold text-xl">
              S
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Sports Tracker</h1>
              <p className="text-neutral-500 text-xs">Real-time scores & stats</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Quick Links - Featured leagues */}
        <section className="mb-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Link
              href="/sport/football/nfl"
              className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-900/80 to-blue-950 p-4 border border-blue-800/50 hover:border-blue-700 transition-all"
            >
              <div className="flex items-center gap-3">
                <img src={leagueLogos.nfl} alt="NFL" className="w-10 h-10 object-contain" />
                <div>
                  <span className="font-semibold text-sm">NFL</span>
                  <p className="text-blue-300 text-xs">Football</p>
                </div>
              </div>
            </Link>
            <Link
              href="/sport/basketball/nba"
              className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-orange-900/80 to-orange-950 p-4 border border-orange-800/50 hover:border-orange-700 transition-all"
            >
              <div className="flex items-center gap-3">
                <img src={leagueLogos.nba} alt="NBA" className="w-10 h-10 object-contain" />
                <div>
                  <span className="font-semibold text-sm">NBA</span>
                  <p className="text-orange-300 text-xs">Basketball</p>
                </div>
              </div>
            </Link>
            <Link
              href="/sport/baseball/mlb"
              className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-red-900/80 to-red-950 p-4 border border-red-800/50 hover:border-red-700 transition-all"
            >
              <div className="flex items-center gap-3">
                <img src={leagueLogos.mlb} alt="MLB" className="w-10 h-10 object-contain" />
                <div>
                  <span className="font-semibold text-sm">MLB</span>
                  <p className="text-red-300 text-xs">Baseball</p>
                </div>
              </div>
            </Link>
            <Link
              href="/sport/hockey/nhl"
              className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-cyan-900/80 to-cyan-950 p-4 border border-cyan-800/50 hover:border-cyan-700 transition-all"
            >
              <div className="flex items-center gap-3">
                <img src={leagueLogos.nhl} alt="NHL" className="w-10 h-10 object-contain" />
                <div>
                  <span className="font-semibold text-sm">NHL</span>
                  <p className="text-cyan-300 text-xs">Hockey</p>
                </div>
              </div>
            </Link>
          </div>
        </section>

        {/* All Sports */}
        <section className="mb-10">
          <h2 className="section-header">All Sports</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {Object.entries(SPORTS_CONFIG).map(([sportKey, sport]) => (
              <Link
                key={sportKey}
                href={`/sport/${sportKey}`}
                className="group bg-neutral-900 hover:bg-neutral-800 rounded-lg p-4 transition-all border border-neutral-800 hover:border-neutral-700"
              >
                <div className="flex items-center gap-3">
                  {sportLogos[sportKey] ? (
                    <img src={sportLogos[sportKey]} alt={sport.name} className="w-8 h-8 object-contain opacity-80 group-hover:opacity-100 transition-opacity" />
                  ) : (
                    <div className="w-8 h-8 bg-neutral-800 rounded flex items-center justify-center text-xs font-bold text-neutral-400">
                      {sport.name.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <h3 className="font-medium text-sm">{sport.name}</h3>
                    <p className="text-neutral-500 text-xs">
                      {Object.keys(sport.leagues).length} league{Object.keys(sport.leagues).length > 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Historic Games */}
        <section className="mb-10">
          <h2 className="section-header">Classic Games</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Link
              href="/sport/basketball/nba/game/400878160"
              className="bg-neutral-900 hover:bg-neutral-800 rounded-lg p-4 transition-all border border-neutral-800 hover:border-yellow-600/50 group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-yellow-600/20 rounded-lg flex items-center justify-center">
                  <img src={leagueLogos.nba} alt="NBA" className="w-8 h-8 object-contain" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-sm group-hover:text-yellow-500 transition-colors">2016 NBA Finals Game 7</h3>
                  <p className="text-neutral-500 text-xs">Cavaliers vs Warriors - The greatest game ever</p>
                </div>
                <span className="text-yellow-600 text-xs font-medium">CLASSIC</span>
              </div>
            </Link>
            <Link
              href="/sport/football/nfl/game/400999173"
              className="bg-neutral-900 hover:bg-neutral-800 rounded-lg p-4 transition-all border border-neutral-800 hover:border-blue-600/50 group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-600/20 rounded-lg flex items-center justify-center">
                  <img src={leagueLogos.nfl} alt="NFL" className="w-8 h-8 object-contain" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-sm group-hover:text-blue-500 transition-colors">Super Bowl LI</h3>
                  <p className="text-neutral-500 text-xs">Patriots vs Falcons - 28-3 Comeback</p>
                </div>
                <span className="text-blue-600 text-xs font-medium">CLASSIC</span>
              </div>
            </Link>
            <Link
              href="/sport/football/nfl/game/401547417"
              className="bg-neutral-900 hover:bg-neutral-800 rounded-lg p-4 transition-all border border-neutral-800 hover:border-red-600/50 group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-red-600/20 rounded-lg flex items-center justify-center">
                  <img src={leagueLogos.nfl} alt="NFL" className="w-8 h-8 object-contain" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-sm group-hover:text-red-500 transition-colors">Super Bowl LVII</h3>
                  <p className="text-neutral-500 text-xs">Chiefs vs Eagles - 2023</p>
                </div>
                <span className="text-red-600 text-xs font-medium">CLASSIC</span>
              </div>
            </Link>
            <Link
              href="/sport/hockey/nhl/game/401559457"
              className="bg-neutral-900 hover:bg-neutral-800 rounded-lg p-4 transition-all border border-neutral-800 hover:border-cyan-600/50 group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-cyan-600/20 rounded-lg flex items-center justify-center">
                  <img src={leagueLogos.nhl} alt="NHL" className="w-8 h-8 object-contain" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-sm group-hover:text-cyan-500 transition-colors">2023 Stanley Cup Final</h3>
                  <p className="text-neutral-500 text-xs">Golden Knights vs Panthers - Game 5</p>
                </div>
                <span className="text-cyan-600 text-xs font-medium">CLASSIC</span>
              </div>
            </Link>
          </div>
        </section>

        {/* Tools Section */}
        <section className="mb-10">
          <h2 className="section-header">Tools</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Link
              href="/tools/streams"
              className="bg-gradient-to-br from-purple-900/50 to-purple-950/50 hover:from-purple-900/70 hover:to-purple-950/70 rounded-lg p-5 transition-all border border-purple-800/30 hover:border-purple-700/50"
            >
              <h3 className="font-semibold mb-1">Stream URL Builder</h3>
              <p className="text-purple-300 text-sm">Build and parse ESPN HLS stream URLs</p>
            </Link>
            <div className="bg-neutral-900/50 rounded-lg p-5 border border-neutral-800 opacity-60">
              <h3 className="font-semibold mb-1 text-neutral-400">AI Rap Recap</h3>
              <p className="text-neutral-500 text-sm">Generate game recaps from detail pages</p>
            </div>
          </div>
        </section>

        {/* API Info */}
        <section className="mb-10">
          <h2 className="section-header">API Reference</h2>
          <div className="bg-neutral-900 rounded-lg p-5 border border-neutral-800">
            <p className="text-neutral-400 text-sm mb-4">ESPN Public API endpoints:</p>
            <div className="space-y-2 font-mono text-xs">
              <div className="bg-black/50 rounded px-3 py-2 border border-neutral-800">
                <span className="text-green-500">GET</span>
                <span className="text-neutral-400 ml-2">/apis/site/v2/sports/{'{sport}'}/{'{league}'}/scoreboard</span>
              </div>
              <div className="bg-black/50 rounded px-3 py-2 border border-neutral-800">
                <span className="text-green-500">GET</span>
                <span className="text-neutral-400 ml-2">/apis/site/v2/sports/{'{sport}'}/{'{league}'}/summary?event={'{id}'}</span>
              </div>
              <div className="bg-black/50 rounded px-3 py-2 border border-neutral-800">
                <span className="text-green-500">GET</span>
                <span className="text-neutral-400 ml-2">/apis/site/v2/sports/{'{sport}'}/{'{league}'}/teams</span>
              </div>
            </div>
          </div>
        </section>
      </div>

      <footer className="border-t border-neutral-800 py-6 px-4">
        <div className="max-w-7xl mx-auto text-center text-neutral-500 text-sm">
          Data provided by ESPN API. Unofficial application.
        </div>
      </footer>
    </main>
  );
}
