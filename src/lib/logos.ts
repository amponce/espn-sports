// Official league logos from ESPN CDN
export const leagueLogos: Record<string, string> = {
  // Football
  nfl: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/leagues/500/nfl.png',
  'college-football': 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/ncaa/500/ncaa.png',
  xfl: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/leagues/500/xfl.png',
  cfl: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/leagues/500/cfl.png',

  // Basketball
  nba: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/leagues/500/nba.png',
  wnba: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/leagues/500/wnba.png',
  'mens-college-basketball': 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/ncaa/500/ncaa.png',
  'womens-college-basketball': 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/ncaa/500/ncaa.png',

  // Baseball
  mlb: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/leagues/500/mlb.png',

  // Hockey
  nhl: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/leagues/500/nhl.png',

  // Soccer
  eng1: 'https://a.espncdn.com/combiner/i?img=/i/leaguelogos/soccer/500/23.png', // Premier League
  eng2: 'https://a.espncdn.com/combiner/i?img=/i/leaguelogos/soccer/500/24.png', // Championship
  esp1: 'https://a.espncdn.com/combiner/i?img=/i/leaguelogos/soccer/500/15.png', // La Liga
  ger1: 'https://a.espncdn.com/combiner/i?img=/i/leaguelogos/soccer/500/10.png', // Bundesliga
  ita1: 'https://a.espncdn.com/combiner/i?img=/i/leaguelogos/soccer/500/12.png', // Serie A
  fra1: 'https://a.espncdn.com/combiner/i?img=/i/leaguelogos/soccer/500/9.png',  // Ligue 1
  mls: 'https://a.espncdn.com/combiner/i?img=/i/leaguelogos/soccer/500/19.png',  // MLS
  uefa: 'https://a.espncdn.com/combiner/i?img=/i/leaguelogos/soccer/500/2.png',  // Champions League
  fifa: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/countries/500/fifa.png',

  // MMA
  ufc: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/leagues/500/ufc.png',

  // Golf, Racing, Tennis - no ESPN league logos available, will use text fallback
};

// Sport logos (generic sport icons)
export const sportLogos: Record<string, string> = {
  football: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/leagues/500/nfl.png',
  basketball: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/leagues/500/nba.png',
  baseball: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/leagues/500/mlb.png',
  hockey: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/leagues/500/nhl.png',
  soccer: 'https://a.espncdn.com/combiner/i?img=/i/leaguelogos/soccer/500/23.png',
  mma: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/leagues/500/ufc.png',
  // golf, racing, tennis will use fallback text
};
