'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { GameSummary } from '@/lib/espn-api';

interface Props {
  sport: string;
  league: string;
  gameId: string;
  isLive?: boolean;
  gameSummary: GameSummary;
}

type TabType = 'boxscore' | 'plays' | 'videos' | 'info';

export function GameClient({ sport, league, gameId, isLive, gameSummary }: Props) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('boxscore');

  // Auto-refresh for live games
  useEffect(() => {
    if (!isLive) return;

    const interval = setInterval(() => {
      router.refresh();
    }, 15000); // Refresh every 15 seconds for live games

    return () => clearInterval(interval);
  }, [isLive, router]);

  const tabs = [
    { id: 'boxscore' as const, label: 'Box Score', available: !!gameSummary.boxscore },
    { id: 'plays' as const, label: 'Play-by-Play', available: !!(gameSummary.drives || gameSummary.plays || gameSummary.scoringPlays) },
    { id: 'videos' as const, label: 'Videos & Streams', available: !!(gameSummary.videos?.length || gameSummary.header?.links?.length) },
    { id: 'info' as const, label: 'Game Info', available: true },
  ];

  const isCompleted = gameSummary.header?.competitions?.[0]?.status?.type?.completed;

  return (
    <div>
      {/* Rap Recap Generator Link - Only show for completed games */}
      {isCompleted && (
        <div className="mb-6">
          <Link
            href={`/sport/${sport}/${league}/game/${gameId}/recap`}
            className="inline-flex items-center gap-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 px-6 py-3 rounded-xl font-bold transition-all transform hover:scale-105"
          >
            <span className="text-2xl">🎤</span>
            <span>Generate AI Rap Recap</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
          <p className="text-gray-500 text-sm mt-2">
            Create a 60-second rap recap of this game for your content
          </p>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-700 overflow-x-auto">
        {tabs.filter(t => t.available).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`pb-2 px-4 border-b-2 whitespace-nowrap transition-colors ${
              activeTab === tab.id
                ? 'border-red-500 text-white font-semibold'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'boxscore' && <BoxScoreTab gameSummary={gameSummary} />}
      {activeTab === 'plays' && <PlaysTab gameSummary={gameSummary} />}
      {activeTab === 'videos' && <VideosTab gameSummary={gameSummary} gameId={gameId} />}
      {activeTab === 'info' && <GameInfoTab gameSummary={gameSummary} />}
    </div>
  );
}

function BoxScoreTab({ gameSummary }: { gameSummary: GameSummary }) {
  const boxscore = gameSummary.boxscore;
  if (!boxscore) return <div className="text-gray-400">Box score not available</div>;

  return (
    <div className="space-y-8">
      {/* Team Stats */}
      {boxscore.teams && boxscore.teams.length >= 2 && (
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-xl font-bold mb-4">Team Stats</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-2 px-4">Stat</th>
                  <th className="text-center py-2 px-4">{boxscore.teams[0]?.team?.displayName || 'Away'}</th>
                  <th className="text-center py-2 px-4">{boxscore.teams[1]?.team?.displayName || 'Home'}</th>
                </tr>
              </thead>
              <tbody>
                {boxscore.teams[0]?.statistics?.map((stat, i) => (
                  <tr key={i} className="border-b border-gray-700/50">
                    <td className="py-2 px-4 text-gray-400">{stat.label}</td>
                    <td className="text-center py-2 px-4">{stat.displayValue}</td>
                    <td className="text-center py-2 px-4">{boxscore.teams[1]?.statistics?.[i]?.displayValue || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Player Stats */}
      {boxscore.players?.map((teamPlayers, teamIndex) => (
        <div key={teamIndex} className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-3">
            {teamPlayers.team?.logo && (
              <img
                src={teamPlayers.team.logo || teamPlayers.team.logos?.[0]?.href}
                alt=""
                className="w-8 h-8 object-contain"
              />
            )}
            {teamPlayers.team?.displayName || `Team ${teamIndex + 1}`}
          </h3>

          {teamPlayers.statistics?.map((statGroup, i) => (
            <div key={i} className="mb-6 last:mb-0">
              <h4 className="text-lg font-semibold text-gray-300 mb-3">{statGroup.name}</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-700 text-gray-400">
                      <th className="text-left py-2 px-2">Player</th>
                      {statGroup.labels?.map((label, j) => (
                        <th key={j} className="text-center py-2 px-2">{label}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {statGroup.athletes?.map((athlete, j) => (
                      <tr key={j} className="border-b border-gray-700/50 hover:bg-gray-700/30">
                        <td className="py-2 px-2">
                          <div className="flex items-center gap-2">
                            {athlete.athlete.headshot?.href && (
                              <img
                                src={athlete.athlete.headshot.href}
                                alt=""
                                className="w-8 h-8 rounded-full object-cover"
                              />
                            )}
                            <div>
                              <div className="font-medium">{athlete.athlete.shortName}</div>
                              <div className="text-xs text-gray-500">
                                {athlete.athlete.position?.abbreviation} #{athlete.athlete.jersey}
                              </div>
                            </div>
                          </div>
                        </td>
                        {athlete.stats?.map((stat, k) => (
                          <td key={k} className="text-center py-2 px-2">{stat}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      ))}

      {/* Game Leaders */}
      {gameSummary.leaders && gameSummary.leaders.length > 0 && (
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-xl font-bold mb-4">Game Leaders</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {gameSummary.leaders.map((leader, i) => (
              <div key={i} className="bg-gray-700/50 rounded-lg p-4">
                <h4 className="text-sm text-gray-400 mb-2">{leader.displayName}</h4>
                {leader.leaders?.[0] && (
                  <div className="flex items-center gap-3">
                    {leader.leaders[0].athlete?.headshot?.href && (
                      <img
                        src={leader.leaders[0].athlete.headshot.href}
                        alt=""
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    )}
                    <div>
                      <div className="font-semibold">{leader.leaders[0].athlete?.displayName}</div>
                      <div className="text-xl font-bold text-red-400">{leader.leaders[0].displayValue}</div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function PlaysTab({ gameSummary }: { gameSummary: GameSummary }) {
  const [expandedDrive, setExpandedDrive] = useState<string | null>(null);

  // For football, show drives
  if (gameSummary.drives && gameSummary.drives.length > 0) {
    return (
      <div className="space-y-4">
        <h3 className="text-xl font-bold mb-4">Drive Summary</h3>
        {gameSummary.drives.map((drive) => (
          <div key={drive.id} className="bg-gray-800 rounded-lg overflow-hidden">
            <button
              onClick={() => setExpandedDrive(expandedDrive === drive.id ? null : drive.id)}
              className="w-full p-4 text-left hover:bg-gray-700/50 transition-colors"
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  {drive.team?.logo && (
                    <img
                      src={drive.team.logo || drive.team.logos?.[0]?.href}
                      alt=""
                      className="w-6 h-6 object-contain"
                    />
                  )}
                  <span className="font-semibold">{drive.team?.displayName}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`px-2 py-1 rounded text-sm ${
                    drive.isScore ? 'bg-green-600' : 'bg-gray-600'
                  }`}>
                    {drive.displayResult || drive.result}
                  </span>
                  <span className="text-gray-400 text-sm">
                    {drive.offensivePlays} plays, {drive.yards} yards
                  </span>
                  <svg
                    className={`w-5 h-5 transition-transform ${expandedDrive === drive.id ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </button>

            {expandedDrive === drive.id && drive.plays && (
              <div className="border-t border-gray-700 p-4 space-y-2 max-h-96 overflow-y-auto">
                {drive.plays.map((play) => (
                  <div
                    key={play.id}
                    className={`p-2 rounded ${
                      play.scoringPlay ? 'bg-green-900/30 border-l-2 border-green-500' : 'bg-gray-700/30'
                    }`}
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <span className="text-gray-400 text-sm">
                          {play.start?.down && `${play.start.down}${getOrdinalSuffix(play.start.down)} & ${play.start.distance}`}
                          {play.clock?.displayValue && ` • ${play.clock.displayValue}`}
                        </span>
                        <p className="mt-1">{play.text}</p>
                      </div>
                      {play.scoringPlay && (
                        <span className="text-green-400 font-bold">
                          +{play.scoreValue}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  }

  // For other sports, show scoring plays or all plays
  const scoringPlays = gameSummary.scoringPlays;
  if (scoringPlays && scoringPlays.length > 0) {
    return (
      <div className="space-y-4">
        <h3 className="text-xl font-bold mb-4">Scoring Plays</h3>
        {scoringPlays.map((play, i) => (
          <div key={play.id || i} className="bg-gray-800 rounded-lg p-4 border-l-4 border-green-500">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-gray-400 text-sm">
                  {play.period?.number && `Period ${play.period.number}`}
                  {play.clock?.displayValue && ` • ${play.clock.displayValue}`}
                </span>
                <p className="mt-1">{play.text}</p>
                {play.scoringType && (
                  <span className="text-sm text-gray-500">{play.scoringType.displayName}</span>
                )}
              </div>
              <div className="text-right">
                <div className="text-lg font-bold">
                  {play.awayScore} - {play.homeScore}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return <div className="text-gray-400">Play-by-play not available for this game</div>;
}

function VideosTab({ gameSummary, gameId }: { gameSummary: GameSummary; gameId: string }) {
  const videos = gameSummary.videos || [];
  const links = gameSummary.header?.links || [];

  // Look for potential stream identifiers in the data
  const possibleStreamIds = extractStreamIdentifiers(gameSummary);

  return (
    <div className="space-y-6">
      {/* Stream Information */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-xl font-bold mb-4">Stream Information</h3>
        <p className="text-gray-400 mb-4">
          ESPN streams are delivered via Akamai CDN. The stream URLs follow this pattern:
        </p>
        <code className="block bg-gray-900 p-4 rounded text-green-400 text-sm overflow-x-auto">
          https://service-pkgespn.akamaized.net/opp/hls/espn/&#123;category&#125;/&#123;year&#125;/&#123;mmdd&#125;/&#123;uuid&#125;/&#123;uuid&#125;/playlist.m3u8
        </code>

        {possibleStreamIds.length > 0 && (
          <div className="mt-4">
            <h4 className="font-semibold mb-2">Potential Stream Identifiers Found:</h4>
            <ul className="space-y-2">
              {possibleStreamIds.map((id, i) => (
                <li key={i} className="bg-gray-700 p-2 rounded text-sm font-mono">
                  {id}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-4 p-4 bg-yellow-900/20 border border-yellow-600/30 rounded">
          <p className="text-yellow-200 text-sm">
            Note: Live streams require ESPN+ authentication. The public API provides game metadata
            and highlights, but direct stream access typically requires a valid subscription.
          </p>
        </div>
      </div>

      {/* Video Highlights */}
      {videos.length > 0 && (
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-xl font-bold mb-4">Video Highlights</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {videos.map((video) => (
              <div key={video.id} className="bg-gray-700 rounded-lg overflow-hidden">
                {video.thumbnail && (
                  <div className="relative">
                    <img
                      src={video.thumbnail}
                      alt={video.headline}
                      className="w-full aspect-video object-cover"
                    />
                    <div className="absolute bottom-2 right-2 bg-black/80 px-2 py-1 rounded text-xs">
                      {Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, '0')}
                    </div>
                  </div>
                )}
                <div className="p-4">
                  <h4 className="font-semibold">{video.headline}</h4>
                  <p className="text-gray-400 text-sm mt-1">{video.description}</p>
                  {video.links?.source?.href && (
                    <a
                      href={video.links.source.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block mt-2 text-red-400 hover:text-red-300 text-sm"
                    >
                      Watch Video &rarr;
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Related Links */}
      {links.length > 0 && (
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-xl font-bold mb-4">Related Links</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {links.map((link, i) => (
              <a
                key={i}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gray-700 hover:bg-gray-600 p-3 rounded transition-colors flex items-center justify-between"
              >
                <span>{link.text}</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Broadcast Info */}
      {gameSummary.header?.competitions?.[0]?.broadcasts && gameSummary.header.competitions[0].broadcasts.length > 0 && (
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-xl font-bold mb-4">Broadcast Information</h3>
          <div className="space-y-2">
            {gameSummary.header.competitions[0].broadcasts
              .filter((broadcast) => broadcast?.names?.length)
              .map((broadcast, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-gray-400">{broadcast.market || 'Broadcast'}:</span>
                  <span className="font-semibold">{broadcast.names?.join(', ') || 'N/A'}</span>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Raw API Data */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-xl font-bold mb-4">API Endpoint</h3>
        <code className="block bg-gray-900 p-4 rounded text-green-400 text-sm overflow-x-auto">
          https://site.web.api.espn.com/apis/site/v2/sports/&#123;sport&#125;/&#123;league&#125;/summary?event={gameId}
        </code>
        <p className="text-gray-400 text-sm mt-2">
          Use this endpoint to fetch the complete game data programmatically.
        </p>
      </div>
    </div>
  );
}

function GameInfoTab({ gameSummary }: { gameSummary: GameSummary }) {
  const gameInfo = gameSummary.gameInfo;
  const header = gameSummary.header;
  const pickcenter = gameSummary.pickcenter;
  const predictor = gameSummary.predictor;

  return (
    <div className="space-y-6">
      {/* Venue Info */}
      {gameInfo?.venue && (
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-xl font-bold mb-4">Venue</h3>
          <div className="space-y-2">
            <p className="text-lg font-semibold">{gameInfo.venue.fullName}</p>
            {gameInfo.venue.address && (
              <p className="text-gray-400">
                {gameInfo.venue.address.city}
                {gameInfo.venue.address.state && `, ${gameInfo.venue.address.state}`}
              </p>
            )}
            {gameInfo.venue.capacity && (
              <p className="text-gray-400">Capacity: {gameInfo.venue.capacity.toLocaleString()}</p>
            )}
            {gameInfo.attendance && (
              <p className="text-gray-400">Attendance: {gameInfo.attendance.toLocaleString()}</p>
            )}
          </div>
        </div>
      )}

      {/* Officials */}
      {gameInfo?.officials && gameInfo.officials.length > 0 && (
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-xl font-bold mb-4">Officials</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {gameInfo.officials.map((official, i) => (
              <div key={i} className="flex justify-between">
                <span className="text-gray-400">{official.position?.name || 'Official'}</span>
                <span>{official.displayName}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Betting Lines */}
      {pickcenter && pickcenter.length > 0 && (
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-xl font-bold mb-4">Betting Lines</h3>
          <div className="space-y-4">
            {pickcenter.map((pick, i) => (
              <div key={i} className="bg-gray-700/50 p-4 rounded">
                <p className="font-semibold mb-2">{pick.provider?.name || 'Line'}</p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Spread:</span>
                    <span className="ml-2">{pick.spread > 0 ? '+' : ''}{pick.spread}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">O/U:</span>
                    <span className="ml-2">{pick.overUnder}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Predictor */}
      {predictor && (predictor.homeTeam || predictor.awayTeam) && (
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-xl font-bold mb-4">Win Probability</h3>
          <div className="flex items-center gap-4">
            {predictor.awayTeam && (
              <div className="flex-1 text-center">
                <p className="text-2xl font-bold">{predictor.awayTeam.gameProjection}%</p>
                <p className="text-gray-400 text-sm">Away</p>
              </div>
            )}
            <div className="w-px h-12 bg-gray-600"></div>
            {predictor.homeTeam && (
              <div className="flex-1 text-center">
                <p className="text-2xl font-bold">{predictor.homeTeam.gameProjection}%</p>
                <p className="text-gray-400 text-sm">Home</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Article/Recap */}
      {gameSummary.article && (
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-xl font-bold mb-4">Game Recap</h3>
          <h4 className="text-lg font-semibold mb-2">{gameSummary.article.headline}</h4>
          <p className="text-gray-300">{gameSummary.article.description}</p>
          {gameSummary.article.story && (
            <div
              className="mt-4 text-gray-400 prose prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: gameSummary.article.story }}
            />
          )}
        </div>
      )}
    </div>
  );
}

function extractStreamIdentifiers(gameSummary: GameSummary): string[] {
  const identifiers: string[] = [];

  // Look through videos for potential stream IDs
  if (gameSummary.videos) {
    gameSummary.videos.forEach(video => {
      if (video.links?.source?.href) {
        // Extract any UUID-like patterns
        const uuidMatch = video.links.source.href.match(/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/gi);
        if (uuidMatch) {
          identifiers.push(...uuidMatch);
        }
      }
    });
  }

  // Look through header links
  if (gameSummary.header?.links) {
    gameSummary.header.links.forEach(link => {
      const uuidMatch = link.href.match(/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/gi);
      if (uuidMatch) {
        identifiers.push(...uuidMatch);
      }
    });
  }

  return [...new Set(identifiers)];
}

function getOrdinalSuffix(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
}
