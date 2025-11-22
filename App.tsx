import React, { useState } from 'react';
import { Radio, Mic2, Info, BarChart3 } from 'lucide-react';
import AudioUploader from './components/AudioUploader';
import ChatBot from './components/ChatBot';
import AnalysisResults from './components/AnalysisResults';
import { analyzeAudioTrack } from './services/geminiService';
import { fileToBase64 } from './services/audioUtils';
import { AnalysisResult, AppState } from './types';

function App() {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleFileProcess = async (file: File) => {
    try {
      setAppState(AppState.ANALYZING);
      setErrorMsg(null);

      const base64Audio = await fileToBase64(file);
      const analysis = await analyzeAudioTrack(base64Audio, file.type);
      
      setResult(analysis);
      setAppState(AppState.RESULTS);
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to analyze track. Please try again later or check your API key.");
      setAppState(AppState.ERROR);
    }
  };

  const resetApp = () => {
    setAppState(AppState.IDLE);
    setResult(null);
    setErrorMsg(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 selection:bg-blue-500/30">
      
      {/* Navbar */}
      <nav className="border-b border-slate-800 bg-slate-950/50 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3" onClick={resetApp} role="button">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Radio className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
              RadioSafe
            </span>
          </div>
          <div className="flex items-center gap-6 text-sm font-medium text-slate-400">
            <span className="hidden md:flex items-center gap-2 hover:text-blue-400 transition-colors cursor-pointer">
              <BarChart3 className="w-4 h-4" /> Analytics
            </span>
            <span className="hidden md:flex items-center gap-2 hover:text-blue-400 transition-colors cursor-pointer">
              <Info className="w-4 h-4" /> Guidelines
            </span>
            <div className="h-4 w-px bg-slate-800 mx-2"></div>
            <div className="flex items-center gap-2 text-green-400 bg-green-400/10 px-3 py-1 rounded-full text-xs">
              <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
              System Online
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Header Section */}
        <div className="text-center mb-12 space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
            Content Moderation <span className="text-blue-500">Redefined</span>
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Upload your audio tracks for instant AI-powered lyrical analysis. 
            Detect explicit content, flag FCC violations, and ensure your broadcast stays compliant.
          </p>
        </div>

        {/* Dynamic Content Area */}
        <div className="transition-all duration-500 ease-in-out">
          {appState === AppState.IDLE && (
            <div className="max-w-2xl mx-auto animate-fade-in-up">
              <AudioUploader 
                onFileSelected={handleFileProcess} 
                isLoading={false} 
              />
              
              <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800">
                  <Mic2 className="w-8 h-8 text-blue-400 mx-auto mb-3" />
                  <h3 className="font-semibold text-slate-200">Smart Transcription</h3>
                  <p className="text-sm text-slate-500 mt-2">Word-for-word accuracy powered by Gemini 2.5 Flash.</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800">
                  <Radio className="w-8 h-8 text-purple-400 mx-auto mb-3" />
                  <h3 className="font-semibold text-slate-200">FCC Compliance</h3>
                  <p className="text-sm text-slate-500 mt-2">Instant flagging of the "Seven Dirty Words" and more.</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800">
                  <BarChart3 className="w-8 h-8 text-emerald-400 mx-auto mb-3" />
                  <h3 className="font-semibold text-slate-200">Risk Analysis</h3>
                  <p className="text-sm text-slate-500 mt-2">Get a clear Clean/Explicit rating with confidence scores.</p>
                </div>
              </div>
            </div>
          )}

          {appState === AppState.ANALYZING && (
            <div className="max-w-2xl mx-auto">
               <AudioUploader 
                onFileSelected={() => {}} 
                isLoading={true} 
              />
              <div className="mt-8 text-center space-y-2">
                <div className="w-full bg-slate-800 rounded-full h-2 max-w-xs mx-auto overflow-hidden">
                  <div className="bg-blue-500 h-full rounded-full animate-progress w-full origin-left"></div>
                </div>
                <p className="text-slate-400 text-sm animate-pulse">Processing audio waveform & analyzing lyrics...</p>
              </div>
            </div>
          )}

          {appState === AppState.RESULTS && result && (
            <div className="space-y-8">
               <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-white">Analysis Report</h2>
                  <button 
                    onClick={resetApp}
                    className="text-sm text-slate-400 hover:text-white underline decoration-slate-700 hover:decoration-white underline-offset-4 transition-all"
                  >
                    Analyze Another Track
                  </button>
               </div>
               <AnalysisResults result={result} />
            </div>
          )}

          {appState === AppState.ERROR && (
            <div className="text-center max-w-md mx-auto p-8 bg-red-500/10 border border-red-500/20 rounded-2xl">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Info className="w-8 h-8 text-red-400" />
              </div>
              <h3 className="text-xl font-bold text-red-400 mb-2">Analysis Failed</h3>
              <p className="text-slate-400 mb-6">{errorMsg}</p>
              <button 
                onClick={resetApp}
                className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      </main>

      <ChatBot />
      
      <style>{`
        @keyframes progress {
          0% { transform: scaleX(0); }
          50% { transform: scaleX(0.7); }
          100% { transform: scaleX(1); }
        }
        .animate-progress {
          animation: progress 2s ease-in-out infinite;
        }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out forwards;
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
}

export default App;