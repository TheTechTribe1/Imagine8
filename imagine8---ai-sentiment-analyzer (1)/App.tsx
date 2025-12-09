import React, { useState } from 'react';
import { InputSection } from './components/InputSection';
import { ResultsDashboard } from './components/ResultsDashboard';
import { ResultList } from './components/ResultList';
import { analyzeTexts } from './services/geminiService';
import { AnalysisResult } from './types';
import { Sparkles, MessageSquare, Github } from 'lucide-react';

const App: React.FC = () => {
  const [results, setResults] = useState<AnalysisResult[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async (texts: string[]) => {
    setIsAnalyzing(true);
    setError(null);
    try {
      const data = await analyzeTexts(texts);
      // Prepend new results to keep history visible or replace? 
      // Let's replace for a cleaner "session" feel, but in a real app might append.
      setResults(data); 
    } catch (err) {
      setError("Failed to analyze text. Please check your API key and try again.");
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
              <Sparkles className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">
              Imagine8
            </h1>
          </div>
          <div className="flex items-center gap-4 text-sm font-medium text-slate-500">
             <span className="hidden sm:inline">Powered by Gemini 2.5</span>
             <a href="#" className="hover:text-indigo-600 transition-colors"><Github className="w-5 h-5"/></a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        
        {/* Hero / Intro */}
        <div className="text-center space-y-2 mb-8">
          <h2 className="text-3xl font-bold text-slate-900">Unlock the Emotion in Text</h2>
          <p className="text-slate-500 max-w-2xl mx-auto">
            Upload customer reviews, feedback, or any text to instantly analyze sentiment, calculate confidence scores, and extract driving keywords using AI.
          </p>
        </div>

        {/* Input Area */}
        <section>
          <InputSection onAnalyze={handleAnalyze} isAnalyzing={isAnalyzing} />
        </section>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
            <MessageSquare className="w-5 h-5" />
            {error}
          </div>
        )}

        {/* Results Area */}
        {results.length > 0 && (
          <section className="space-y-8">
            <div className="border-t border-slate-200 pt-8">
              <ResultsDashboard results={results} />
            </div>
            <div className="border-t border-slate-200 pt-8">
              <ResultList results={results} />
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default App;