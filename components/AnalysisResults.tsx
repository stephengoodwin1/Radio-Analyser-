import React, { useState } from 'react';
import { AlertTriangle, CheckCircle, Volume2, Mic2, PlayCircle, PauseCircle } from 'lucide-react';
import { AnalysisResult, LyricWord } from '../types';
import { generateSpeech } from '../services/geminiService';
import { playAudioData } from '../services/audioUtils';

interface AnalysisResultsProps {
  result: AnalysisResult;
}

const AnalysisResults: React.FC<AnalysisResultsProps> = ({ result }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioSource, setAudioSource] = useState<AudioBufferSourceNode | null>(null);

  const handleReadAnalysis = async () => {
    if (isPlaying && audioSource) {
      audioSource.stop();
      setIsPlaying(false);
      return;
    }

    try {
      setIsPlaying(true);
      const textToRead = `Analysis complete. This track is rated ${result.rating}. ${result.summary}.`;
      const base64Audio = await generateSpeech(textToRead);
      
      if (base64Audio) {
        const source = await playAudioData(base64Audio);
        setAudioSource(source);
        source.onended = () => setIsPlaying(false);
      } else {
        setIsPlaying(false);
      }
    } catch (err) {
      console.error("Failed to play TTS", err);
      setIsPlaying(false);
    }
  };

  const getRatingColor = (rating: string) => {
    switch (rating) {
      case 'Clean': return 'text-green-400 border-green-500/30 bg-green-500/10';
      case 'Explicit': return 'text-red-400 border-red-500/30 bg-red-500/10';
      case 'Risky': return 'text-amber-400 border-amber-500/30 bg-amber-500/10';
      default: return 'text-slate-400';
    }
  };

  const getRatingIcon = (rating: string) => {
    switch (rating) {
      case 'Clean': return <CheckCircle className="w-6 h-6" />;
      case 'Explicit': return <Mic2 className="w-6 h-6" />; // Using Mic2 as generic, maybe Prohibited icon better but keeping simple
      default: return <AlertTriangle className="w-6 h-6" />;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Card */}
      <div className={`p-6 rounded-xl border ${getRatingColor(result.rating)} flex flex-col md:flex-row justify-between items-start md:items-center gap-4`}>
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-full bg-current/10">
            {getRatingIcon(result.rating)}
          </div>
          <div>
            <h2 className="text-2xl font-bold uppercase tracking-wider">{result.rating}</h2>
            <p className="text-sm opacity-80">Confidence: {result.confidence}%</p>
          </div>
        </div>
        
        <button 
          onClick={handleReadAnalysis}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-600 transition-colors text-slate-200 text-sm font-medium"
        >
          {isPlaying ? <PauseCircle className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          {isPlaying ? 'Stop Reading' : 'Read Summary'}
        </button>
      </div>

      {/* Summary */}
      <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
        <h3 className="text-lg font-semibold text-slate-200 mb-2">AI Summary</h3>
        <p className="text-slate-300 leading-relaxed">{result.summary}</p>
      </div>

      {/* Lyrics Analysis */}
      <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
        <h3 className="text-lg font-semibold text-slate-200 mb-4 flex items-center gap-2">
          <Mic2 className="w-5 h-5 text-blue-400" />
          Lyrics Transcript
        </h3>
        <div className="bg-slate-900/50 p-6 rounded-lg border border-slate-800 font-mono text-sm leading-7 text-slate-300 whitespace-pre-wrap">
          {result.lyrics.map((word, idx) => (
            <React.Fragment key={idx}>
              <span 
                className={`
                  inline-block px-0.5 rounded
                  ${word.isExplicit ? 'bg-red-500/20 text-red-400 font-bold underline decoration-red-500/50' : ''}
                `}
                title={word.reason || undefined}
              >
                {word.text}
              </span>
              {/* Add space naturally, unless punctuation implies otherwise (simplified here) */}
              {' '}
            </React.Fragment>
          ))}
        </div>
        <div className="mt-4 text-xs text-slate-500 text-center">
          * Red highlighted words are flagged as potential FCC violations or explicit content.
        </div>
      </div>
    </div>
  );
};

export default AnalysisResults;
