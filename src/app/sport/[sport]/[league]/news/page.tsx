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

  return (
    <main className="min-h-screen bg-gray-900 text-white">
      <header className="bg-gradient-to-r from-red-700 to-red-900 py-6 px-4">
        <div className="max-w-7xl mx-auto">
          <Link href={`/sport/${sport}/${league}`} className="text-red-200 hover:text-white text-sm mb-2 inline-block">
            &larr; Back to {leagueConfig.name}
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-5xl">{sportConfig.icon}</span>
            <div>
              <h1 className="text-4xl font-bold">{leagueConfig.name} News</h1>
              <p className="text-red-200">{newsData.header || 'Latest headlines'}</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Navigation tabs */}
        <div className="flex gap-4 mb-8 border-b border-gray-700">
          <Link
            href={`/sport/${sport}/${league}`}
            className="pb-2 px-4 border-b-2 border-transparent text-gray-400 hover:text-white"
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
            className="pb-2 px-4 border-b-2 border-red-500 text-white font-semibold"
          >
            News
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {articles.map((article, i) => (
            <article
              key={i}
              className="bg-gray-800 rounded-lg overflow-hidden hover:bg-gray-700/80 transition-colors"
            >
              {article.images?.[0] && (
                <img
                  src={article.images[0].url}
                  alt={article.headline}
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-4">
                <h2 className="text-lg font-semibold mb-2">{article.headline}</h2>
                {article.description && (
                  <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                    {article.description}
                  </p>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 text-xs">
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
                      className="text-red-400 hover:text-red-300 text-sm"
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
                        className="bg-gray-700 text-gray-300 text-xs px-2 py-1 rounded"
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
          <div className="text-center py-12 text-gray-400">
            <p>No news articles available</p>
          </div>
        )}
      </div>
    </main>
  );
}
