import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getNews, SPORTS_CONFIG, SportKey } from '@/lib/espn-api';

interface Props {
  params: Promise<{ sport: string; league: string }>;
}

export default async function NewsPage({ params }: Props) {
  const { sport, league } = await params;

  if (!(sport in SPORTS_CONFIG)) {
    notFound();
  }

  const sportConfig = SPORTS_CONFIG[sport as SportKey];
  const leagueConfigRaw = sportConfig.leagues[league as keyof typeof sportConfig.leagues];

  if (!leagueConfigRaw) {
    notFound();
  }

  const leagueConfig = leagueConfigRaw as { name: string; slug: string };

  let newsData;
  try {
    newsData = await getNews(sport, league);
  } catch (error) {
    console.error('Failed to fetch news:', error);
    newsData = { header: '', articles: [] };
  }

  const articles = newsData.articles || [];

  // Determine the correct nav links based on sport type
  const isMMA = sport === 'mma';
  const isGolf = sport === 'golf';
  const secondTabLink = isMMA ? 'fighters' : isGolf ? 'players' : 'teams';
  const secondTabLabel = isMMA ? 'Fighters' : isGolf ? 'Players' : 'Teams';
  const firstTabLabel = isGolf ? 'Leaderboard' : isMMA ? 'Events' : 'Scores';

  return (
    <main className="min-h-screen bg-black text-white">
      <header className="border-b border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Link
            href={`/sport/${sport}/${league}`}
            className="text-neutral-500 hover:text-white text-xs mb-3 inline-flex items-center gap-1 transition-colors"
          >
            <span>&larr;</span> Back to {leagueConfig.name}
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-4xl">{sportConfig.icon}</span>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{leagueConfig.name} News</h1>
              <p className="text-neutral-500 text-sm">{newsData.header || 'Latest headlines'}</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Navigation tabs */}
        <div className="tab-nav mb-6">
          <Link href={`/sport/${sport}/${league}`} className="tab-item">
            {firstTabLabel}
          </Link>
          {!isMMA && (
            <Link href={`/sport/${sport}/${league}/${secondTabLink}`} className="tab-item">
              {secondTabLabel}
            </Link>
          )}
          <Link href={`/sport/${sport}/${league}/news`} className="tab-item active">
            News
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {articles.map((article, i) => (
            <article
              key={i}
              className="bg-neutral-900 rounded-lg overflow-hidden hover:bg-neutral-800 transition-colors border border-neutral-800 hover:border-neutral-700"
            >
              {article.images?.[0] && (
                <img
                  src={article.images[0].url}
                  alt={article.headline}
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-4">
                <h2 className="text-base font-semibold mb-2">{article.headline}</h2>
                {article.description && (
                  <p className="text-neutral-400 text-sm mb-3 line-clamp-2">
                    {article.description}
                  </p>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-neutral-500 text-xs">
                    {new Date(article.published).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                  {article.links?.web?.href && (
                    <a
                      href={article.links.web.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-red-500 hover:text-red-400 text-sm"
                    >
                      Read More &rarr;
                    </a>
                  )}
                </div>
                {article.categories && article.categories.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {article.categories.slice(0, 3).map((cat, j) => (
                      <span
                        key={j}
                        className="bg-neutral-800 text-neutral-400 text-xs px-2 py-1 rounded"
                      >
                        {cat.description}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>

        {articles.length === 0 && (
          <div className="text-center py-16 text-neutral-500">
            <p className="text-lg">No news articles available</p>
          </div>
        )}
      </div>
    </main>
  );
}
