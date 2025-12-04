'use client';

import { useState } from 'react';
import type { RapRecapData, RecapPrompt } from '@/lib/rap-generator';
import { generateAIPrompt, formatForTeleprompter } from '@/lib/rap-generator';
import type { GameSummary } from '@/lib/espn-api';

interface Props {
  recapData: RapRecapData;
  gameId: string;
  gameSummary: GameSummary;
}

export function RecapClient({ recapData, gameId, gameSummary }: Props) {
  const [generatedLyrics, setGeneratedLyrics] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState<'hype' | 'chill' | 'storyteller'>('hype');
  const [showPrompt, setShowPrompt] = useState(false);

  const aiPrompt = generateAIPrompt(recapData);

  const handleGenerate = async () => {
    setIsGenerating(true);
    // Simulate AI generation (replace with actual AI API call)
    // In production, this would call Claude or another AI API
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Use template-based generation for demo
    const lyrics = generateDemoLyrics(recapData, selectedStyle);
    setGeneratedLyrics(lyrics);
    setIsGenerating(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const downloadLyrics = () => {
    const blob = new Blob([generatedLyrics], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rap-recap-${gameId}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      {/* Game Data Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Key Performers */}
        <div className="bg-gray-800/50 backdrop-blur rounded-xl p-6 border border-purple-500/20">
          <h3 className="text-xl font-bold mb-4 text-purple-300">Key Performers</h3>
          <div className="space-y-3">
            {recapData.topPerformers.map((performer, i) => (
              <div key={i} className="flex items-center justify-between bg-gray-700/30 p-3 rounded-lg">
                <span className="font-semibold">{performer.name}</span>
                <span className="text-purple-400">{performer.stats}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Key Plays */}
        <div className="bg-gray-800/50 backdrop-blur rounded-xl p-6 border border-purple-500/20">
          <h3 className="text-xl font-bold mb-4 text-purple-300">Key Plays</h3>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {recapData.keyPlays.length > 0 ? (
              recapData.keyPlays.map((play, i) => (
                <div key={i} className="text-sm text-gray-300 p-2 bg-gray-700/30 rounded">
                  {play}
                </div>
              ))
            ) : (
              <p className="text-gray-500">No key plays extracted</p>
            )}
          </div>
        </div>
      </div>

      {/* Style Selector */}
      <div className="bg-gray-800/50 backdrop-blur rounded-xl p-6 border border-purple-500/20">
        <h3 className="text-xl font-bold mb-4 text-purple-300">Select Style</h3>
        <div className="grid grid-cols-3 gap-4">
          {[
            { id: 'hype' as const, name: 'Hype', desc: 'High energy, pump-up vibes', emoji: '🔥' },
            { id: 'chill' as const, name: 'Chill', desc: 'Smooth, laid-back flow', emoji: '😎' },
            { id: 'storyteller' as const, name: 'Storyteller', desc: 'Narrative-driven', emoji: '📖' },
          ].map((style) => (
            <button
              key={style.id}
              onClick={() => setSelectedStyle(style.id)}
              className={`p-4 rounded-xl border-2 transition-all ${
                selectedStyle === style.id
                  ? 'border-purple-500 bg-purple-500/20'
                  : 'border-gray-600 bg-gray-700/30 hover:border-gray-500'
              }`}
            >
              <div className="text-3xl mb-2">{style.emoji}</div>
              <div className="font-bold">{style.name}</div>
              <div className="text-xs text-gray-400">{style.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Generate Button */}
      <div className="flex justify-center gap-4">
        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:opacity-50 disabled:cursor-not-allowed px-8 py-4 rounded-xl font-bold text-lg transition-all transform hover:scale-105"
        >
          {isGenerating ? (
            <span className="flex items-center gap-2">
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Generating...
            </span>
          ) : (
            'Generate Rap Recap'
          )}
        </button>

        <button
          onClick={() => setShowPrompt(!showPrompt)}
          className="bg-gray-700 hover:bg-gray-600 px-6 py-4 rounded-xl font-semibold transition-all"
        >
          {showPrompt ? 'Hide' : 'Show'} AI Prompt
        </button>
      </div>

      {/* AI Prompt Display */}
      {showPrompt && (
        <div className="bg-gray-800/50 backdrop-blur rounded-xl p-6 border border-purple-500/20">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-purple-300">AI Prompt</h3>
            <button
              onClick={() => copyToClipboard(aiPrompt.systemPrompt + '\n\n' + aiPrompt.userPrompt)}
              className="text-sm bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded"
            >
              Copy Prompt
            </button>
          </div>
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-semibold text-gray-400 mb-2">System Prompt:</h4>
              <pre className="bg-gray-900 p-4 rounded-lg text-sm text-green-400 overflow-x-auto whitespace-pre-wrap">
                {aiPrompt.systemPrompt}
              </pre>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-400 mb-2">User Prompt:</h4>
              <pre className="bg-gray-900 p-4 rounded-lg text-sm text-blue-400 overflow-x-auto whitespace-pre-wrap">
                {aiPrompt.userPrompt}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* Generated Lyrics */}
      {generatedLyrics && (
        <div className="bg-gray-800/50 backdrop-blur rounded-xl p-6 border border-purple-500/20">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-purple-300">Generated Rap Recap</h3>
            <div className="flex gap-2">
              <button
                onClick={() => copyToClipboard(generatedLyrics)}
                className="text-sm bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded"
              >
                Copy
              </button>
              <button
                onClick={downloadLyrics}
                className="text-sm bg-purple-600 hover:bg-purple-500 px-3 py-1 rounded"
              >
                Download
              </button>
            </div>
          </div>
          <div className="bg-gray-900 rounded-lg p-6">
            <pre className="whitespace-pre-wrap font-mono text-lg leading-relaxed">
              {generatedLyrics}
            </pre>
          </div>
          <div className="mt-4 flex items-center gap-4 text-sm text-gray-400">
            <span>~{recapData.duration} seconds</span>
            <span>•</span>
            <span>16 bars max</span>
            <span>•</span>
            <span>Family-friendly</span>
          </div>
        </div>
      )}

      {/* Teleprompter Mode */}
      {generatedLyrics && (
        <div className="bg-gray-800/50 backdrop-blur rounded-xl p-6 border border-purple-500/20">
          <h3 className="text-xl font-bold mb-4 text-purple-300">Teleprompter Format</h3>
          <pre className="bg-gray-900 p-4 rounded-lg text-sm text-yellow-400 overflow-x-auto">
            {formatForTeleprompter(generatedLyrics.split('\n').filter((l) => l.trim()))}
          </pre>
        </div>
      )}

      {/* Video/Stream Integration */}
      <div className="bg-gray-800/50 backdrop-blur rounded-xl p-6 border border-purple-500/20">
        <h3 className="text-xl font-bold mb-4 text-purple-300">Video Integration</h3>
        <p className="text-gray-400 mb-4">
          Connect your HLS player to display game highlights alongside the rap. Stream URLs follow this pattern:
        </p>
        <code className="block bg-gray-900 p-4 rounded-lg text-green-400 text-sm overflow-x-auto mb-4">
          https://service-pkgespn.akamaized.net/opp/hls/espn/&#123;category&#125;/&#123;year&#125;/&#123;mmdd&#125;/&#123;uuid&#125;/playlist.m3u8
        </code>

        {gameSummary.videos && gameSummary.videos.length > 0 && (
          <div className="mt-4">
            <h4 className="font-semibold mb-2">Available Video Highlights:</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {gameSummary.videos.slice(0, 4).map((video) => (
                <div key={video.id} className="bg-gray-700/30 p-3 rounded-lg">
                  <div className="font-medium text-sm">{video.headline}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    Duration: {Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, '0')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Usage Guidelines */}
      <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-xl p-6">
        <h3 className="text-xl font-bold mb-4 text-yellow-300">Usage Guidelines</h3>
        <ul className="space-y-2 text-yellow-200/80">
          <li>• Keep videos under 60 seconds for fair use compliance</li>
          <li>• Use original artwork when monetizing content</li>
          <li>• Credit source material appropriately</li>
          <li>• Non-monetized content can use game footage with rap overlay</li>
          <li>• Build audience with recap content, monetize with original art</li>
        </ul>
      </div>
    </div>
  );
}

function generateDemoLyrics(data: RapRecapData, style: 'hype' | 'chill' | 'storyteller'): string {
  const { winner, loser, finalScore, topPerformers } = data;
  const [winScore, loseScore] = finalScore.split('-');

  const topPlayer = topPerformers[0]?.name || 'The MVP';
  const topStats = topPerformers[0]?.stats || 'going crazy';

  if (style === 'hype') {
    return `[VERSE 1]
Yo, ${winner} came through with the heat tonight
Every play they made was dynamite
${loser} tried to ball but they couldn't compete
When ${winner} on the court they just can't be beat

[CHORUS]
${winScore} to ${loseScore}, that's the final score
${winner} got the W, they wanted more
Game over, lights out, nothing left to say
${winner} dominated, they ran the play!

[VERSE 2]
${topPlayer} was ${topStats}
Had the whole crowd going crazy, they impressed
Every shot was money, every move was clean
Best performance that the fans have ever seen

[OUTRO]
${winner} stands tall, victory tonight
Another W added, future looking bright!`;
  }

  if (style === 'chill') {
    return `[VERSE 1]
Let me paint the picture of what went down
${winner} rolling through, wearing that crown
Smooth and steady, no need to rush
${loser} felt the pressure, felt the crush

[CHORUS]
${winScore} - ${loseScore}, yeah that's how it ended
${winner} showed up, message was sent kid
Cool, calm, collected all game
Walking off the court with all the fame

[VERSE 2]
${topPlayer} doing what they do
${topStats}, man the numbers flew
Easy buckets, easy plays all night
${winner} made it look so light

[OUTRO]
That's the recap, smooth and clean
${winner} living out the dream`;
  }

  // Storyteller style
  return `[VERSE 1]
Picture this: the arena packed tight
${winner} versus ${loser} under the lights
The tension building, fans on their feet
Two teams ready, both wanting that seat

[CHORUS]
When the dust settled, the story was told
${winner} came through, hearts bold
${winScore} to ${loseScore}, written in the books
Another chapter closed, just take a look

[VERSE 2]
${topPlayer} rose up to the stage
${topStats}, turning the page
Every moment a verse, every play a rhyme
${winner} captured glory, one more time

[OUTRO]
And so the tale ends, the champions stand
${winner} victorious, as planned`;
}
