import React from 'react';
import { AnalysisResult, SentimentType } from '../types';
import { CheckCircle2, AlertCircle, MinusCircle, Highlighter } from 'lucide-react';

interface ResultListProps {
  results: AnalysisResult[];
}

const SentimentIcon = ({ type }: { type: SentimentType }) => {
  switch (type) {
    case SentimentType.POSITIVE:
      return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
    case SentimentType.NEGATIVE:
      return <AlertCircle className="w-5 h-5 text-rose-500" />;
    default:
      return <MinusCircle className="w-5 h-5 text-slate-400" />;
  }
};

const HighlightedText = ({ text, keywords }: { text: string, keywords: string[] }) => {
  if (!keywords || keywords.length === 0) return <span className="text-slate-700">{text}</span>;

  // Simple highlight logic: regex replace for keywords
  // Sort keywords by length desc to avoid partial matches of longer keywords
  const sortedKeywords = [...keywords].sort((a, b) => b.length - a.length);
  const pattern = new RegExp(`(${sortedKeywords.map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'gi');
  
  const parts = text.split(pattern);

  return (
    <p className="text-slate-700 leading-relaxed">
      {parts.map((part, i) => {
        const isMatch = sortedKeywords.some(k => k.toLowerCase() === part.toLowerCase());
        return isMatch ? (
          <span key={i} className="bg-yellow-100 text-yellow-800 px-1 rounded-sm font-medium border-b-2 border-yellow-200">
            {part}
          </span>
        ) : (
          <span key={i}>{part}</span>
        );
      })}
    </p>
  );
};

export const ResultList: React.FC<ResultListProps> = ({ results }) => {
  if (results.length === 0) return null;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 mt-8 mb-4">
        <Highlighter className="w-5 h-5 text-indigo-600" />
        Detailed Analysis ({results.length})
      </h3>
      <div className="grid gap-4">
        {results.map((result) => (
          <div 
            key={result.id} 
            className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-2">
                <SentimentIcon type={result.sentiment} />
                <span className={`text-sm font-bold uppercase tracking-wider
                  ${result.sentiment === SentimentType.POSITIVE ? 'text-emerald-600' : 
                    result.sentiment === SentimentType.NEGATIVE ? 'text-rose-600' : 'text-slate-500'}
                `}>
                  {result.sentiment}
                </span>
              </div>
              <div className="flex items-center gap-2" title="Confidence Score">
                 <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                   <div 
                      className={`h-full rounded-full ${
                        result.sentiment === SentimentType.POSITIVE ? 'bg-emerald-500' : 
                        result.sentiment === SentimentType.NEGATIVE ? 'bg-rose-500' : 'bg-slate-400'
                      }`}
                      style={{ width: `${result.confidence * 100}%` }}
                   />
                 </div>
                 <span className="text-xs font-mono text-slate-500">{(result.confidence * 100).toFixed(0)}%</span>
              </div>
            </div>
            
            <div className="mb-4 text-sm">
              <HighlightedText text={result.originalText} keywords={result.keywords} />
            </div>

            {result.keywords.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {result.keywords.map((keyword, idx) => (
                  <span key={idx} className="px-2 py-1 bg-slate-50 text-slate-600 text-xs rounded border border-slate-200">
                    #{keyword}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
