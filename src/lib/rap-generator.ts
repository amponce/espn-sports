import type { GameSummary } from './espn-api';

export interface RapRecapData {
  gameTitle: string;
  winner: string;
  loser: string;
  finalScore: string;
  keyPlays: string[];
  topPerformers: Array<{
    name: string;
    team: string;
    stats: string;
  }>;
  gameNarrative: string;
  suggestedRapLines: string[];
  duration: number; // Target duration in seconds (max 60)
}

export function extractGameRecapData(gameSummary: GameSummary): RapRecapData {
  const header = gameSummary.header;
  const competition = header?.competitions?.[0];
  const homeCompetitor = competition?.competitors.find((c) => c.homeAway === 'home');
  const awayCompetitor = competition?.competitors.find((c) => c.homeAway === 'away');

  const homeScore = parseInt(homeCompetitor?.score || '0');
  const awayScore = parseInt(awayCompetitor?.score || '0');

  const winner = homeScore > awayScore ? homeCompetitor : awayCompetitor;
  const loser = homeScore > awayScore ? awayCompetitor : homeCompetitor;

  // Extract key plays (scoring plays)
  const keyPlays: string[] = [];
  if (gameSummary.scoringPlays) {
    gameSummary.scoringPlays.slice(-5).forEach((play) => {
      keyPlays.push(play.text);
    });
  }

  // Extract drives for football
  if (gameSummary.drives) {
    gameSummary.drives
      .filter((d) => d.isScore)
      .slice(-5)
      .forEach((drive) => {
        if (drive.displayResult) {
          keyPlays.push(`${drive.team?.displayName}: ${drive.displayResult} - ${drive.yards} yards`);
        }
      });
  }

  // Extract top performers
  const topPerformers: Array<{ name: string; team: string; stats: string }> = [];
  if (gameSummary.leaders) {
    gameSummary.leaders.forEach((leader) => {
      if (leader.leaders?.[0]) {
        const l = leader.leaders[0];
        topPerformers.push({
          name: l.athlete?.displayName || 'Unknown',
          team: l.athlete?.team?.id || '',
          stats: `${l.displayValue} ${leader.shortDisplayName || leader.name}`,
        });
      }
    });
  }

  // Generate game narrative
  let gameNarrative = '';
  if (gameSummary.article?.description) {
    gameNarrative = gameSummary.article.description;
  } else if (winner && loser) {
    gameNarrative = `${winner.team.displayName} defeated ${loser.team.displayName} ${winner.score}-${loser.score}`;
  }

  // Generate suggested rap lines (template-based, AI would enhance these)
  const suggestedRapLines = generateRapLines(
    winner?.team.displayName || 'Winners',
    loser?.team.displayName || 'Losers',
    winner?.score || '0',
    loser?.score || '0',
    topPerformers,
    keyPlays
  );

  return {
    gameTitle: header?.competitions?.[0]?.competitors
      ? `${awayCompetitor?.team.displayName} vs ${homeCompetitor?.team.displayName}`
      : 'Game Recap',
    winner: winner?.team.displayName || 'Winner',
    loser: loser?.team.displayName || 'Loser',
    finalScore: `${winner?.score || 0}-${loser?.score || 0}`,
    keyPlays,
    topPerformers,
    gameNarrative,
    suggestedRapLines,
    duration: 55, // Target 55 seconds to stay under 1 min
  };
}

function generateRapLines(
  winner: string,
  loser: string,
  winnerScore: string,
  loserScore: string,
  topPerformers: Array<{ name: string; team: string; stats: string }>,
  keyPlays: string[]
): string[] {
  const lines: string[] = [];

  // Intro hook
  lines.push(`Yo, let me tell you 'bout this game tonight`);
  lines.push(`${winner} came through and they came to fight`);

  // Score callout
  lines.push(`Final score was ${winnerScore} to ${loserScore}`);
  lines.push(`${loser} tried hard but they couldn't get more`);

  // Top performer shoutouts
  topPerformers.slice(0, 2).forEach((performer) => {
    const firstName = performer.name.split(' ')[0];
    lines.push(`${firstName} went crazy, ${performer.stats}`);
    lines.push(`When he's on the court, you know he never rests`);
  });

  // Key plays
  if (keyPlays.length > 0) {
    lines.push(`Big plays all night, let me break it down`);
    lines.push(`${winner} wearing that crown`);
  }

  // Outro
  lines.push(`${winner} takes the W, that's how it goes`);
  lines.push(`Another victory, and everybody knows`);

  return lines;
}

export function formatForTeleprompter(lines: string[], bpm: number = 90): string {
  // Format rap lines for teleprompter display with timing markers
  const secondsPerLine = 60 / bpm * 2; // Roughly 2 bars per line
  let output = '';

  lines.forEach((line, i) => {
    const timestamp = (i * secondsPerLine).toFixed(1);
    output += `[${timestamp}s] ${line}\n`;
  });

  return output;
}

export interface RecapPrompt {
  systemPrompt: string;
  userPrompt: string;
}

export function generateAIPrompt(recapData: RapRecapData): RecapPrompt {
  const systemPrompt = `You are a sports rap lyricist who creates engaging, rhythmic game recaps in a hip-hop style.
Your lyrics should:
- Be family-friendly and suitable for all audiences
- Have strong rhythm and flow (aim for consistent syllable counts per line)
- Include specific game details (scores, player names, key plays)
- Be energetic and celebratory of great plays from both teams
- Stay under 16 bars (about 55 seconds when performed)
- Use sports terminology and metaphors
- End with a memorable hook or punchline

Format your response as:
[VERSE 1]
(4 lines)

[CHORUS]
(4 lines - should be catchy and repeatable)

[VERSE 2]
(4 lines)

[OUTRO]
(2-4 lines)`;

  const userPrompt = `Create a rap recap for this game:

GAME: ${recapData.gameTitle}
FINAL SCORE: ${recapData.winner} ${recapData.finalScore.split('-')[0]} - ${recapData.loser} ${recapData.finalScore.split('-')[1]}

KEY PERFORMERS:
${recapData.topPerformers.map((p) => `- ${p.name}: ${p.stats}`).join('\n')}

KEY PLAYS:
${recapData.keyPlays.map((p) => `- ${p}`).join('\n')}

GAME SUMMARY:
${recapData.gameNarrative}

Create an engaging rap recap that highlights the winner's victory while respecting both teams. Make it energetic and fun!`;

  return { systemPrompt, userPrompt };
}
