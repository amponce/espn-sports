/**
 * ESPN Stream URL Builder
 *
 * ESPN delivers streams via Akamai CDN with URLs following this pattern:
 * https://service-pkgespn.akamaized.net/opp/hls/espn/{category}/{year}/{mmdd}/{uuid}/{uuid}/playlist.m3u8
 *
 * The UUID is the key identifier that links to a specific video stream.
 * These UUIDs can be discovered through network traffic inspection when watching ESPN content.
 */

export interface StreamUrlConfig {
  uuid: string;
  date: Date;
  category?: string; // Default: 'wsc'
}

export interface StreamInfo {
  uuid: string;
  m3u8Url: string;
  date: string;
  category: string;
}

const AKAMAI_BASE = 'https://service-pkgespn.akamaized.net/opp/hls/espn';

/**
 * Build an m3u8 stream URL from components
 */
export function buildStreamUrl(config: StreamUrlConfig): string {
  const { uuid, date, category = 'wsc' } = config;

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const mmdd = `${month}${day}`;

  return `${AKAMAI_BASE}/${category}/${year}/${mmdd}/${uuid}/${uuid}/playlist.m3u8`;
}

/**
 * Parse an m3u8 URL to extract its components
 */
export function parseStreamUrl(url: string): StreamInfo | null {
  // Pattern: https://service-pkgespn.akamaized.net/opp/hls/espn/{category}/{year}/{mmdd}/{uuid}/{uuid}/playlist.m3u8
  const regex = /service-pkgespn\.akamaized\.net\/opp\/hls\/espn\/([^/]+)\/(\d{4})\/(\d{4})\/([a-f0-9-]+)\/([a-f0-9-]+)\/playlist\.m3u8/i;
  const match = url.match(regex);

  if (!match) return null;

  const [, category, year, mmdd, uuid1, uuid2] = match;

  // Verify UUIDs match (they should be the same)
  if (uuid1 !== uuid2) {
    console.warn('UUID mismatch in stream URL:', uuid1, uuid2);
  }

  const month = mmdd.slice(0, 2);
  const day = mmdd.slice(2, 4);

  return {
    uuid: uuid1,
    m3u8Url: url,
    date: `${year}-${month}-${day}`,
    category,
  };
}

/**
 * Extract potential stream UUIDs from any URL or text
 */
export function extractUuids(text: string): string[] {
  const uuidRegex = /[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/gi;
  const matches = text.match(uuidRegex);
  return matches ? [...new Set(matches)] : [];
}

/**
 * Common ESPN stream categories
 */
export const STREAM_CATEGORIES = {
  wsc: 'Web Stream Content',
  watch: 'ESPN Watch',
  espnplus: 'ESPN+',
  live: 'Live Streams',
  vod: 'Video on Demand',
  highlights: 'Highlights',
  replays: 'Game Replays',
} as const;

/**
 * Build possible stream URLs to try based on game info
 * Since we don't know the exact UUID, this generates template URLs
 */
export function buildStreamTemplates(gameDate: Date, possibleUuids: string[]): StreamInfo[] {
  const templates: StreamInfo[] = [];

  for (const category of Object.keys(STREAM_CATEGORIES)) {
    for (const uuid of possibleUuids) {
      const url = buildStreamUrl({ uuid, date: gameDate, category });
      templates.push({
        uuid,
        m3u8Url: url,
        date: gameDate.toISOString().split('T')[0],
        category,
      });
    }
  }

  return templates;
}

/**
 * Validate if a URL follows the ESPN Akamai pattern
 */
export function isValidEspnStreamUrl(url: string): boolean {
  return url.includes('service-pkgespn.akamaized.net') &&
         url.includes('/playlist.m3u8');
}

/**
 * Get discovery instructions for finding stream UUIDs
 */
export function getStreamDiscoveryInstructions(): string {
  return `
## How to Find ESPN Stream UUIDs

Stream UUIDs are not exposed in the public API. To find them:

### Method 1: Network Traffic Inspection
1. Open ESPN's website and navigate to a game or video
2. Open Developer Tools (F12) → Network tab
3. Filter by 'fetch' or 'xhr'
4. Look for requests to 'akamaized.net' or containing UUIDs
5. The UUID format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx

### Method 2: Video Player Inspection
1. Right-click on video player → Inspect Element
2. Look for video source URLs in the HTML
3. Search for 'playlist.m3u8' or 'master.m3u8'

### Method 3: Browser Extension
Use a network traffic analyzer extension to capture stream URLs.

### URL Pattern:
\`https://service-pkgespn.akamaized.net/opp/hls/espn/{category}/{year}/{mmdd}/{uuid}/{uuid}/playlist.m3u8\`

### Categories:
- wsc: Web Stream Content (most common)
- watch: ESPN Watch app content
- espnplus: ESPN+ exclusive content
- live: Live game streams
- vod: Video on Demand
- highlights: Game highlights
- replays: Full game replays

### Example:
\`https://service-pkgespn.akamaized.net/opp/hls/espn/wsc/2025/1117/a3c7030e-be5c-462c-bfc0-eedb51242afe/a3c7030e-be5c-462c-bfc0-eedb51242afe/playlist.m3u8\`

Note: ESPN+ streams require authentication. Some streams may have geo-restrictions.
`.trim();
}

/**
 * Format stream URL for display
 */
export function formatStreamUrlDisplay(url: string): string {
  const parsed = parseStreamUrl(url);
  if (!parsed) return url;

  return `
Stream URL: ${url}
UUID: ${parsed.uuid}
Date: ${parsed.date}
Category: ${STREAM_CATEGORIES[parsed.category as keyof typeof STREAM_CATEGORIES] || parsed.category}
`.trim();
}
