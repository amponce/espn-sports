import axios from 'axios';

// ESPN API Base URLs
const ESPN_API_BASE = 'https://site.api.espn.com/apis/site/v2/sports';
const ESPN_WEB_API_BASE = 'https://site.web.api.espn.com/apis/site/v2/sports';
const ESPN_CORE_API = 'https://sports.core.api.espn.com/v2/sports';
const ESPN_CDN = 'https://cdn.espn.com/core';

// Sports and their leagues configuration
export const SPORTS_CONFIG = {
  football: {
    name: 'Football',
    icon: '🏈',
    leagues: {
      nfl: { name: 'NFL', slug: 'nfl' },
      'college-football': { name: 'College Football', slug: 'college-football' },
    },
  },
  basketball: {
    name: 'Basketball',
    icon: '🏀',
    leagues: {
      nba: { name: 'NBA', slug: 'nba' },
      wnba: { name: 'WNBA', slug: 'wnba' },
      'mens-college-basketball': { name: "Men's College Basketball", slug: 'mens-college-basketball' },
      'womens-college-basketball': { name: "Women's College Basketball", slug: 'womens-college-basketball' },
    },
  },
  baseball: {
    name: 'Baseball',
    icon: '⚾',
    leagues: {
      mlb: { name: 'MLB', slug: 'mlb' },
      'college-baseball': { name: 'College Baseball', slug: 'college-baseball' },
    },
  },
  hockey: {
    name: 'Hockey',
    icon: '🏒',
    leagues: {
      nhl: { name: 'NHL', slug: 'nhl' },
    },
  },
  soccer: {
    name: 'Soccer',
    icon: '⚽',
    leagues: {
      // Top European Leagues
      'eng.1': { name: 'Premier League', slug: 'eng.1' },
      'esp.1': { name: 'La Liga', slug: 'esp.1' },
      'ger.1': { name: 'Bundesliga', slug: 'ger.1' },
      'ita.1': { name: 'Serie A', slug: 'ita.1' },
      'fra.1': { name: 'Ligue 1', slug: 'fra.1' },
      // UEFA Competitions
      'uefa.champions': { name: 'Champions League', slug: 'uefa.champions' },
      'uefa.europa': { name: 'Europa League', slug: 'uefa.europa' },
      'uefa.europa.conf': { name: 'Conference League', slug: 'uefa.europa.conf' },
      // Americas
      'usa.1': { name: 'MLS', slug: 'usa.1' },
      'mex.1': { name: 'Liga MX', slug: 'mex.1' },
      'bra.1': { name: 'Brasileirao', slug: 'bra.1' },
      'arg.1': { name: 'Liga Argentina', slug: 'arg.1' },
      'concacaf.champions': { name: 'CONCACAF Champions', slug: 'concacaf.champions' },
      'conmebol.libertadores': { name: 'Copa Libertadores', slug: 'conmebol.libertadores' },
      // Other European
      'eng.2': { name: 'Championship', slug: 'eng.2' },
      'ned.1': { name: 'Eredivisie', slug: 'ned.1' },
      'por.1': { name: 'Primeira Liga', slug: 'por.1' },
      'sco.1': { name: 'Scottish Premiership', slug: 'sco.1' },
      // International
      'fifa.world': { name: 'FIFA World Cup', slug: 'fifa.world' },
      'uefa.euro': { name: 'UEFA Euro', slug: 'uefa.euro' },
    },
  },
  mma: {
    name: 'MMA',
    icon: '🥊',
    leagues: {
      ufc: { name: 'UFC', slug: 'ufc' },
    },
  },
  golf: {
    name: 'Golf',
    icon: '⛳',
    leagues: {
      pga: { name: 'PGA Tour', slug: 'pga' },
    },
  },
  racing: {
    name: 'Racing',
    icon: '🏎️',
    leagues: {
      f1: { name: 'Formula 1', slug: 'f1' },
      nascar: { name: 'NASCAR', slug: 'nascar' },
    },
  },
  tennis: {
    name: 'Tennis',
    icon: '🎾',
    leagues: {
      atp: { name: 'ATP', slug: 'atp' },
      wta: { name: 'WTA', slug: 'wta' },
    },
  },
} as const;

export type SportKey = keyof typeof SPORTS_CONFIG;
export type LeagueKey<S extends SportKey> = keyof typeof SPORTS_CONFIG[S]['leagues'];

// TypeScript interfaces for ESPN API responses
export interface Team {
  id: string;
  uid?: string;
  slug?: string;
  abbreviation?: string;
  displayName: string;
  shortDisplayName?: string;
  name?: string;
  nickname?: string;
  location?: string;
  color?: string;
  alternateColor?: string;
  logo?: string;
  logos?: Array<{ href: string; width: number; height: number }>;
  links?: Array<{ href: string; text: string }>;
  record?: {
    items?: Array<{
      summary: string;
      type: string;
    }>;
  };
}

export interface Competitor {
  id: string;
  uid?: string;
  type: string;
  order: number;
  homeAway: 'home' | 'away';
  winner?: boolean;
  team: Team;
  score?: string;
  linescores?: Array<{ value: number }>;
  statistics?: Array<{ name: string; value: string }>;
  records?: Array<{ summary: string; type: string }>;
}

export interface GameStatus {
  clock?: number;
  displayClock?: string;
  period?: number;
  type: {
    id: string;
    name: string;
    state: 'pre' | 'in' | 'post';
    completed: boolean;
    description: string;
    detail: string;
    shortDetail: string;
  };
}

export interface Game {
  id: string;
  uid?: string;
  date: string;
  name: string;
  shortName: string;
  season?: {
    year: number;
    type: number;
    slug: string;
  };
  week?: {
    number: number;
  };
  competitions: Array<{
    id: string;
    uid?: string;
    date: string;
    attendance?: number;
    type: { id: string; abbreviation: string };
    timeValid: boolean;
    neutralSite: boolean;
    conferenceCompetition?: boolean;
    recent?: boolean;
    venue?: {
      id: string;
      fullName: string;
      address?: {
        city: string;
        state?: string;
      };
    };
    competitors: Competitor[];
    status: GameStatus;
    broadcasts?: Array<{
      market: string;
      names: string[];
    }>;
    headlines?: Array<{
      description: string;
      type: string;
      shortLinkText: string;
    }>;
    situation?: {
      lastPlay?: {
        id: string;
        type: { id: string; text: string };
        text: string;
        scoreValue?: number;
        team?: { id: string };
      };
      down?: number;
      yardLine?: number;
      distance?: number;
      downDistanceText?: string;
      shortDownDistanceText?: string;
      possessionText?: string;
      isRedZone?: boolean;
      homeTimeouts?: number;
      awayTimeouts?: number;
    };
  }>;
  links?: Array<{ href: string; text: string; isExternal?: boolean }>;
}

export interface Scoreboard {
  leagues: Array<{
    id: string;
    uid: string;
    name: string;
    abbreviation: string;
    slug: string;
    season: {
      year: number;
      startDate: string;
      endDate: string;
      type: {
        id: string;
        type: number;
        name: string;
        abbreviation: string;
      };
    };
    logos: Array<{ href: string }>;
    calendar?: string[];
    calendarType?: string;
    calendarIsWhitelist?: boolean;
    calendarStartDate?: string;
    calendarEndDate?: string;
  }>;
  events: Game[];
  day?: { date: string };
}

export interface TeamInfo extends Team {
  standingSummary?: string;
  nextEvent?: Game[];
  franchise?: {
    slug: string;
    uid: string;
    id: string;
    location: string;
    name: string;
    nickname: string;
    abbreviation: string;
    displayName: string;
    shortDisplayName: string;
    color: string;
    isActive: boolean;
  };
}

export interface TeamsResponse {
  sports: Array<{
    id: string;
    uid: string;
    name: string;
    slug: string;
    leagues: Array<{
      id: string;
      uid: string;
      name: string;
      abbreviation: string;
      shortName: string;
      slug: string;
      teams: Array<{
        team: TeamInfo;
      }>;
    }>;
  }>;
}

export interface NewsArticle {
  headline: string;
  description?: string;
  published: string;
  lastModified?: string;
  premium?: boolean;
  type: string;
  links: {
    api?: { href: string };
    web?: { href: string };
    mobile?: { href: string };
  };
  images?: Array<{
    name?: string;
    width: number;
    height: number;
    url: string;
    caption?: string;
  }>;
  categories?: Array<{
    id: number;
    description: string;
    type: string;
    sportId?: number;
    leagueId?: number;
    league?: { id: number; description: string };
    uid?: string;
    teamId?: number;
    team?: { id: number; description: string };
    athleteId?: number;
    athlete?: { id: number; description: string };
  }>;
}

export interface NewsResponse {
  header: string;
  articles: NewsArticle[];
}

export interface GameSummary {
  boxscore?: {
    teams: Array<{
      team: Team;
      statistics: Array<{
        name: string;
        displayValue: string;
        label: string;
      }>;
    }>;
    players?: Array<{
      team: Team;
      statistics: Array<{
        name: string;
        keys: string[];
        labels: string[];
        descriptions: string[];
        athletes: Array<{
          athlete: {
            id: string;
            displayName: string;
            shortName: string;
            headshot?: { href: string };
            jersey?: string;
            position?: { abbreviation: string };
          };
          stats: string[];
        }>;
      }>;
    }>;
  };
  gameInfo?: {
    venue?: {
      id: string;
      fullName: string;
      address?: { city: string; state?: string };
      capacity?: number;
    };
    attendance?: number;
    officials?: Array<{
      fullName: string;
      displayName: string;
      position?: { name: string };
    }>;
  };
  drives?: Array<{
    id: string;
    description: string;
    team: Team;
    start?: { period: { number: number }; clock?: { displayValue: string }; yardLine?: number };
    end?: { period: { number: number }; clock?: { displayValue: string }; yardLine?: number };
    timeElapsed?: { displayValue: string };
    yards?: number;
    isScore?: boolean;
    offensivePlays?: number;
    result?: string;
    shortDisplayResult?: string;
    displayResult?: string;
    plays?: Array<{
      id: string;
      sequenceNumber: string;
      type: { id: string; text: string };
      text: string;
      awayScore?: number;
      homeScore?: number;
      period: { number: number };
      clock?: { displayValue: string };
      scoringPlay?: boolean;
      scoreValue?: number;
      team?: { id: string };
      start?: { yardLine?: number; down?: number; distance?: number };
      end?: { yardLine?: number; down?: number; distance?: number };
      statYardage?: number;
    }>;
  }>;
  plays?: Array<{
    id: string;
    sequenceNumber: string;
    type: { id: string; text: string };
    text: string;
    awayScore?: number;
    homeScore?: number;
    period: { number: number };
    clock?: { displayValue: string };
    scoringPlay?: boolean;
    scoreValue?: number;
    team?: { id: string };
  }>;
  leaders?: Array<{
    name: string;
    displayName: string;
    shortDisplayName: string;
    abbreviation: string;
    leaders: Array<{
      displayValue: string;
      value: number;
      athlete: {
        id: string;
        displayName: string;
        shortName: string;
        headshot?: { href: string };
        jersey?: string;
        position?: { abbreviation: string };
        team?: { id: string };
      };
      team?: { id: string };
    }>;
  }>;
  header?: {
    id: string;
    uid: string;
    season: { year: number; type: number };
    timeValid: boolean;
    competitions: Array<{
      id: string;
      date: string;
      competitors: Array<{
        id: string;
        uid: string;
        order: number;
        homeAway: 'home' | 'away';
        winner?: boolean;
        team: Team;
        score?: string;
        linescores?: Array<{ displayValue: string }>;
        record?: Array<{ displayValue: string; type: string }>;
        possession?: boolean;
      }>;
      status: GameStatus;
      broadcasts?: Array<{ market: string; names: string[] }>;
    }>;
    league?: {
      id: string;
      uid: string;
      name: string;
      abbreviation: string;
      slug: string;
    };
    links?: Array<{ href: string; text: string }>;
    week?: number;
  };
  news?: {
    header: string;
    link: { href: string };
    articles: NewsArticle[];
  };
  article?: {
    headline: string;
    description: string;
    published: string;
    story: string;
    images?: Array<{ url: string; caption?: string }>;
  };
  videos?: Array<{
    id: number;
    headline: string;
    description: string;
    duration: number;
    thumbnail: string;
    links: { source: { href: string } };
  }>;
  standings?: unknown;
  pickcenter?: Array<{
    provider: { id: string; name: string };
    details: string;
    overUnder: number;
    spread: number;
    overOdds?: number;
    underOdds?: number;
    awayTeamOdds?: { favorite: boolean; underdog: boolean; moneyLine?: number };
    homeTeamOdds?: { favorite: boolean; underdog: boolean; moneyLine?: number };
  }>;
  againstTheSpread?: Array<{
    team: Team;
    records: Array<{ type: string; summary: string }>;
  }>;
  predictor?: {
    name: string;
    shortName: string;
    homeTeam?: { id: string; gameProjection: string; teamChanceLoss: string };
    awayTeam?: { id: string; gameProjection: string; teamChanceLoss: string };
  };
  winprobability?: Array<{
    tiePercentage: number;
    homeWinPercentage: number;
    secondsLeft: number;
    playId: string;
  }>;
  scoringPlays?: Array<{
    id: string;
    type: { id: string; text: string };
    text: string;
    awayScore: number;
    homeScore: number;
    period: { number: number };
    clock?: { displayValue: string };
    team?: { id: string };
    scoringType?: { name: string; displayName: string; abbreviation: string };
  }>;
}

// API Functions
export async function getScoreboard(sport: string, league: string, date?: string): Promise<Scoreboard> {
  const params = new URLSearchParams();
  if (date) {
    params.append('dates', date);
  }
  const url = `${ESPN_API_BASE}/${sport}/${league}/scoreboard${params.toString() ? '?' + params.toString() : ''}`;
  const response = await axios.get<Scoreboard>(url);
  return response.data;
}

export async function getGameSummary(sport: string, league: string, eventId: string): Promise<GameSummary> {
  // For MMA, the summary API doesn't work - we need to get data from the scoreboard
  if (sport === 'mma') {
    return getMMAEventSummary(league, eventId);
  }

  const url = `${ESPN_WEB_API_BASE}/${sport}/${league}/summary?region=us&lang=en&contentorigin=espn&event=${eventId}`;
  const response = await axios.get<GameSummary>(url);
  return response.data;
}

// Fetch MMA event using the core API
async function getMMAEventSummary(league: string, eventId: string): Promise<GameSummary> {
  try {
    // Get event details from core API
    const eventUrl = `${ESPN_CORE_API}/mma/leagues/${league}/events/${eventId}`;
    const eventResponse = await axios.get(eventUrl);
    const eventData = eventResponse.data;

    // Process competitions (fights) - they're inline in the response
    const competitions: any[] = [];
    if (eventData.competitions && Array.isArray(eventData.competitions)) {
      for (const comp of eventData.competitions) {
        // Get athlete details for each competitor
        const competitors: any[] = [];
        if (comp.competitors && Array.isArray(comp.competitors)) {
          for (const competitor of comp.competitors) {
            let athleteData: any = { id: competitor.id, displayName: 'TBD' };

            // Fetch athlete details if available
            if (competitor.athlete?.$ref) {
              try {
                const athleteResponse = await axios.get(competitor.athlete.$ref);
                athleteData = athleteResponse.data;
              } catch {}
            }

            competitors.push({
              id: competitor.id,
              uid: competitor.uid,
              order: competitor.order,
              winner: competitor.winner,
              athlete: athleteData,
            });
          }
        }

        // Fetch status if it's a $ref
        let status = { type: { state: 'pre', completed: false, shortDetail: 'Scheduled' } };
        if (comp.status?.$ref) {
          try {
            const statusResponse = await axios.get(comp.status.$ref);
            status = statusResponse.data;
          } catch {}
        } else if (comp.status) {
          status = comp.status;
        }

        // Fetch venue if it's a $ref
        let venue = comp.venue;
        if (venue?.$ref && !venue.fullName) {
          try {
            const venueResponse = await axios.get(venue.$ref);
            venue = venueResponse.data;
          } catch {}
        }

        competitions.push({
          id: comp.id,
          date: comp.date,
          status,
          competitors,
          venue,
          type: comp.type,
        });
      }
    }

    return {
      header: {
        id: eventData.id,
        competitions,
        season: eventData.season,
        league: {
          id: '3321',
          name: 'Ultimate Fighting Championship',
          abbreviation: 'UFC',
        },
      },
      gameInfo: {
        venue: competitions[0]?.venue,
      },
      boxscore: {},
    } as GameSummary;
  } catch (error) {
    console.error('Failed to fetch MMA event from core API:', error);
    throw error;
  }
}

export async function getTeams(sport: string, league: string): Promise<TeamsResponse> {
  const url = `${ESPN_API_BASE}/${sport}/${league}/teams`;
  const response = await axios.get<TeamsResponse>(url);
  return response.data;
}

export async function getTeamInfo(sport: string, league: string, teamId: string): Promise<{ team: TeamInfo }> {
  const url = `${ESPN_API_BASE}/${sport}/${league}/teams/${teamId}`;
  const response = await axios.get<{ team: TeamInfo }>(url);
  return response.data;
}

// Get athletes for individual sports (MMA, Golf, Tennis)
export async function getAthletes(sport: string, league: string, limit: number = 100): Promise<AthletesResponse> {
  try {
    const url = `${ESPN_API_BASE}/${sport}/${league}/athletes?limit=${limit}`;
    const response = await axios.get<AthletesResponse>(url);
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch athletes for ${sport}/${league}:`, error);
    return { items: [], athletes: [] };
  }
}

export async function getAthleteInfo(sport: string, league: string, athleteId: string): Promise<AthleteInfo> {
  const url = `${ESPN_API_BASE}/${sport}/${league}/athletes/${athleteId}`;
  const response = await axios.get<AthleteInfo>(url);
  return response.data;
}

// Types for athletes
export interface AthletesResponse {
  sports?: Array<{
    leagues?: Array<{
      athletes?: Athlete[];
    }>;
  }>;
  items?: Athlete[];
  athletes?: Athlete[];
  count?: number;
  pageIndex?: number;
  pageSize?: number;
  pageCount?: number;
}

export interface Athlete {
  id: string;
  uid?: string;
  guid?: string;
  displayName: string;
  shortName?: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  weight?: number;
  height?: number;
  age?: number;
  citizenship?: string;
  flag?: { href: string };
  headshot?: { href: string; alt?: string };
  position?: { name: string; abbreviation: string };
  team?: { id: string; name: string; logo?: string };
  statistics?: any[];
  record?: string;
  ranks?: any[];
}

export interface AthleteInfo extends Athlete {
  bio?: string;
  birthPlace?: { city?: string; state?: string; country?: string };
  college?: { name: string };
  draft?: { year: number; round: number; selection: number };
  experience?: { years: number };
  status?: { type: string; name: string };
  injuries?: any[];
  contracts?: any[];
}

export async function getTeamSchedule(sport: string, league: string, teamId: string): Promise<unknown> {
  const url = `${ESPN_API_BASE}/${sport}/${league}/teams/${teamId}/schedule`;
  const response = await axios.get(url);
  return response.data;
}

export async function getNews(sport: string, league: string): Promise<NewsResponse> {
  const url = `${ESPN_API_BASE}/${sport}/${league}/news`;
  const response = await axios.get<NewsResponse>(url);
  return response.data;
}

export async function getRankings(sport: string, league: string): Promise<unknown> {
  const url = `${ESPN_API_BASE}/${sport}/${league}/rankings`;
  const response = await axios.get(url);
  return response.data;
}

export async function getStandings(sport: string, league: string): Promise<unknown> {
  const url = `${ESPN_API_BASE}/${sport}/${league}/standings`;
  const response = await axios.get(url);
  return response.data;
}

// Helper functions
export function getTeamLogo(team: Team): string {
  if (team.logo) return team.logo;
  if (team.logos && team.logos.length > 0) return team.logos[0].href;
  return '/placeholder-team.png';
}

export function formatGameTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short',
  });
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function getGameState(status: GameStatus): 'pre' | 'in' | 'post' {
  return status.type.state;
}

export function isGameLive(status: GameStatus): boolean {
  return status.type.state === 'in';
}

export function isGameCompleted(status: GameStatus): boolean {
  return status.type.completed;
}

// Historical games - notable events
export const NOTABLE_GAMES = {
  basketball: {
    nba: [
      { id: '400878160', name: '2016 NBA Finals Game 7 - Cavaliers vs Warriors', date: '2016-06-19' },
      { id: '401307777', name: '2021 NBA Finals Game 6 - Bucks vs Suns', date: '2021-07-20' },
      { id: '401584793', name: '2023 NBA Finals Game 5 - Nuggets vs Heat', date: '2023-06-12' },
    ],
  },
  football: {
    nfl: [
      { id: '400999173', name: 'Super Bowl LI - Patriots vs Falcons', date: '2017-02-05' },
      { id: '401326638', name: 'Super Bowl LVI - Rams vs Bengals', date: '2022-02-13' },
      { id: '401547417', name: 'Super Bowl LVII - Chiefs vs Eagles', date: '2023-02-12' },
    ],
  },
  baseball: {
    mlb: [
      { id: '401472105', name: '2022 World Series Game 6 - Astros vs Phillies', date: '2022-11-05' },
    ],
  },
  hockey: {
    nhl: [
      { id: '401559457', name: '2023 Stanley Cup Final Game 5 - Golden Knights vs Panthers', date: '2023-06-13' },
    ],
  },
};

export function getDateString(date?: Date): string {
  const d = date || new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
}
