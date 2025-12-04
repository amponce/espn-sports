'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
  buildStreamUrl,
  parseStreamUrl,
  extractUuids,
  STREAM_CATEGORIES,
  getStreamDiscoveryInstructions,
} from '@/lib/stream-builder';

export default function StreamToolsPage() {
  // URL Builder state
  const [uuid, setUuid] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState('wsc');
  const [builtUrl, setBuiltUrl] = useState('');

  // URL Parser state
  const [parseInput, setParseInput] = useState('');
  const [parsedResult, setParsedResult] = useState<ReturnType<typeof parseStreamUrl>>(null);

  // UUID Extractor state
  const [extractInput, setExtractInput] = useState('');
  const [extractedUuids, setExtractedUuids] = useState<string[]>([]);

  const handleBuildUrl = () => {
    if (!uuid) return;
    const url = buildStreamUrl({
      uuid,
      date: new Date(date),
      category,
    });
    setBuiltUrl(url);
  };

  const handleParseUrl = () => {
    const result = parseStreamUrl(parseInput);
    setParsedResult(result);
  };

  const handleExtractUuids = () => {
    const uuids = extractUuids(extractInput);
    setExtractedUuids(uuids);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <main className="min-h-screen bg-gray-900 text-white">
      <header className="bg-gradient-to-r from-purple-700 to-purple-900 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <Link href="/" className="text-purple-200 hover:text-white text-sm mb-2 inline-block">
            &larr; Back to Home
          </Link>
          <h1 className="text-4xl font-bold">Stream URL Tools</h1>
          <p className="text-purple-200 mt-2">Build and parse ESPN stream URLs</p>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* URL Builder */}
        <section className="bg-gray-800 rounded-xl p-6">
          <h2 className="text-2xl font-bold mb-4">Stream URL Builder</h2>
          <p className="text-gray-400 mb-4">
            Build an m3u8 stream URL from components. You need the UUID from network traffic inspection.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">UUID</label>
              <input
                type="text"
                value={uuid}
                onChange={(e) => setUuid(e.target.value)}
                placeholder="a3c7030e-be5c-462c-bfc0-eedb51242afe"
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white"
              >
                {Object.entries(STREAM_CATEGORIES).map(([key, label]) => (
                  <option key={key} value={key}>
                    {key} - {label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={handleBuildUrl}
                className="bg-purple-600 hover:bg-purple-500 px-6 py-2 rounded-lg font-semibold transition-colors"
              >
                Build URL
              </button>
            </div>
          </div>

          {builtUrl && (
            <div className="mt-4">
              <label className="block text-sm text-gray-400 mb-1">Generated URL</label>
              <div className="flex gap-2">
                <code className="flex-1 bg-gray-900 p-3 rounded-lg text-green-400 text-sm overflow-x-auto">
                  {builtUrl}
                </code>
                <button
                  onClick={() => copyToClipboard(builtUrl)}
                  className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg"
                >
                  Copy
                </button>
              </div>
            </div>
          )}
        </section>

        {/* URL Parser */}
        <section className="bg-gray-800 rounded-xl p-6">
          <h2 className="text-2xl font-bold mb-4">Stream URL Parser</h2>
          <p className="text-gray-400 mb-4">
            Parse an existing ESPN stream URL to extract its components.
          </p>

          <div className="mb-4">
            <label className="block text-sm text-gray-400 mb-1">Stream URL</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={parseInput}
                onChange={(e) => setParseInput(e.target.value)}
                placeholder="https://service-pkgespn.akamaized.net/opp/hls/espn/..."
                className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white"
              />
              <button
                onClick={handleParseUrl}
                className="bg-purple-600 hover:bg-purple-500 px-6 py-2 rounded-lg font-semibold transition-colors"
              >
                Parse
              </button>
            </div>
          </div>

          {parsedResult && (
            <div className="bg-gray-900 rounded-lg p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">UUID:</span>
                <span className="font-mono">{parsedResult.uuid}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Date:</span>
                <span>{parsedResult.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Category:</span>
                <span>
                  {parsedResult.category} -{' '}
                  {STREAM_CATEGORIES[parsedResult.category as keyof typeof STREAM_CATEGORIES] ||
                    'Unknown'}
                </span>
              </div>
            </div>
          )}

          {parseInput && !parsedResult && (
            <div className="bg-red-900/30 border border-red-500/30 rounded-lg p-4 text-red-300">
              Could not parse URL. Make sure it follows the ESPN Akamai pattern.
            </div>
          )}
        </section>

        {/* UUID Extractor */}
        <section className="bg-gray-800 rounded-xl p-6">
          <h2 className="text-2xl font-bold mb-4">UUID Extractor</h2>
          <p className="text-gray-400 mb-4">
            Extract UUIDs from any text (network logs, URLs, etc.)
          </p>

          <div className="mb-4">
            <label className="block text-sm text-gray-400 mb-1">Input Text</label>
            <textarea
              value={extractInput}
              onChange={(e) => setExtractInput(e.target.value)}
              placeholder="Paste network logs, URLs, or any text containing UUIDs..."
              rows={4}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white"
            />
          </div>

          <button
            onClick={handleExtractUuids}
            className="bg-purple-600 hover:bg-purple-500 px-6 py-2 rounded-lg font-semibold transition-colors mb-4"
          >
            Extract UUIDs
          </button>

          {extractedUuids.length > 0 && (
            <div className="space-y-2">
              <label className="block text-sm text-gray-400">Found {extractedUuids.length} UUID(s):</label>
              {extractedUuids.map((uuid, i) => (
                <div key={i} className="flex gap-2">
                  <code className="flex-1 bg-gray-900 p-2 rounded text-green-400 font-mono text-sm">
                    {uuid}
                  </code>
                  <button
                    onClick={() => {
                      setUuid(uuid);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded text-sm"
                  >
                    Use in Builder
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Discovery Instructions */}
        <section className="bg-gray-800 rounded-xl p-6">
          <h2 className="text-2xl font-bold mb-4">How to Find Stream UUIDs</h2>
          <div className="prose prose-invert max-w-none">
            <pre className="bg-gray-900 p-4 rounded-lg text-sm overflow-x-auto whitespace-pre-wrap">
              {getStreamDiscoveryInstructions()}
            </pre>
          </div>
        </section>

        {/* HLS Player Integration */}
        <section className="bg-gray-800 rounded-xl p-6">
          <h2 className="text-2xl font-bold mb-4">HLS Player Integration</h2>
          <p className="text-gray-400 mb-4">
            Once you have the stream URL, you can use it with any HLS-compatible player:
          </p>

          <div className="space-y-4">
            <div className="bg-gray-900 rounded-lg p-4">
              <h3 className="font-semibold mb-2">hls.js (Web)</h3>
              <pre className="text-green-400 text-sm overflow-x-auto">
{`import Hls from 'hls.js';

const video = document.getElementById('video');
const hls = new Hls();

hls.loadSource('YOUR_M3U8_URL');
hls.attachMedia(video);
hls.on(Hls.Events.MANIFEST_PARSED, () => {
  video.play();
});`}
              </pre>
            </div>

            <div className="bg-gray-900 rounded-lg p-4">
              <h3 className="font-semibold mb-2">Video.js</h3>
              <pre className="text-green-400 text-sm overflow-x-auto">
{`import videojs from 'video.js';

const player = videojs('my-video', {
  sources: [{
    src: 'YOUR_M3U8_URL',
    type: 'application/x-mpegURL'
  }]
});`}
              </pre>
            </div>

            <div className="bg-gray-900 rounded-lg p-4">
              <h3 className="font-semibold mb-2">Native (Safari/iOS)</h3>
              <pre className="text-green-400 text-sm overflow-x-auto">
{`<video controls>
  <source src="YOUR_M3U8_URL" type="application/x-mpegURL">
</video>`}
              </pre>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
