import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Download, PieChart as PieIcon, BarChart as BarIcon } from 'lucide-react';
import { AnalysisResult, SentimentType } from '../types';

interface ResultsDashboardProps {
  results: AnalysisResult[];
}

const SENTIMENT_COLORS = {
  [SentimentType.POSITIVE]: '#10b981', // emerald-500
  [SentimentType.NEUTRAL]: '#94a3b8',  // slate-400
  [SentimentType.NEGATIVE]: '#f43f5e', // rose-500
};

export const ResultsDashboard: React.FC<ResultsDashboardProps> = ({ results }) => {
  const stats = useMemo(() => {
    const counts = {
      [SentimentType.POSITIVE]: 0,
      [SentimentType.NEGATIVE]: 0,
      [SentimentType.NEUTRAL]: 0,
    };
    let totalConfidence = 0;

    results.forEach(r => {
      counts[r.sentiment]++;
      totalConfidence += r.confidence;
    });

    return {
      counts,
      avgConfidence: results.length ? (totalConfidence / results.length * 100).toFixed(1) : 0,
      total: results.length
    };
  }, [results]);

  const pieData = [
    { name: 'Positive', value: stats.counts[SentimentType.POSITIVE], color: SENTIMENT_COLORS[SentimentType.POSITIVE] },
    { name: 'Neutral', value: stats.counts[SentimentType.NEUTRAL], color: SENTIMENT_COLORS[SentimentType.NEUTRAL] },
    { name: 'Negative', value: stats.counts[SentimentType.NEGATIVE], color: SENTIMENT_COLORS[SentimentType.NEGATIVE] },
  ].filter(d => d.value > 0);

  const downloadCSV = () => {
    const headers = ['Original Text', 'Sentiment', 'Confidence', 'Keywords'];
    const rows = results.map(r => [
      `"${r.originalText.replace(/"/g, '""')}"`,
      r.sentiment,
      r.confidence.toFixed(2),
      `"${r.keywords.join(', ')}"`
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `sentiment_analysis_${Date.now()}.csv`;
    link.click();
  };

  const downloadJSON = () => {
    const jsonContent = JSON.stringify(results, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `sentiment_analysis_${Date.now()}.json`;
    link.click();
  };

  if (results.length === 0) return null;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <PieIcon className="w-5 h-5 text-indigo-600" />
          Analysis Overview
        </h2>
        <div className="flex gap-2">
           <button onClick={downloadCSV} className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">
            <Download className="w-4 h-4" /> CSV
          </button>
          <button onClick={downloadJSON} className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">
            <Download className="w-4 h-4" /> JSON
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Stat Cards */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div className="text-slate-500 text-sm font-medium mb-1">Total Analyzed</div>
            <div className="text-3xl font-bold text-slate-900">{stats.total}</div>
            <div className="text-xs text-slate-400 mt-2">Text segments processed</div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div className="text-slate-500 text-sm font-medium mb-1">Avg. Confidence</div>
            <div className="text-3xl font-bold text-indigo-600">{stats.avgConfidence}%</div>
            <div className="text-xs text-slate-400 mt-2">Model certainty score</div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
             <div className="text-slate-500 text-sm font-medium mb-1">Dominant Sentiment</div>
             <div className="text-3xl font-bold text-slate-900">
               {stats.counts[SentimentType.POSITIVE] > stats.counts[SentimentType.NEGATIVE] ? 'Positive' : 'Negative'}
             </div>
             <div className="text-xs text-slate-400 mt-2">Based on frequency</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-700 mb-6">Sentiment Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 mt-2">
            {pieData.map(d => (
              <div key={d.name} className="flex items-center gap-2 text-sm text-slate-600">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }}></div>
                {d.name} ({d.value})
              </div>
            ))}
          </div>
        </div>

        {/* Confidence Bar Chart */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
           <h3 className="text-sm font-semibold text-slate-700 mb-6">Confidence by Sentiment</h3>
           <div className="h-64">
             <ResponsiveContainer width="100%" height="100%">
               <BarChart
                 data={[
                   { name: 'Pos', score: stats.counts[SentimentType.POSITIVE] },
                   { name: 'Neu', score: stats.counts[SentimentType.NEUTRAL] },
                   { name: 'Neg', score: stats.counts[SentimentType.NEGATIVE] },
                 ]}
               >
                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                 <XAxis dataKey="name" tickLine={false} axisLine={false} />
                 <YAxis hide />
                 <RechartsTooltip cursor={{fill: '#f1f5f9'}} />
                 <Bar dataKey="score" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={40} />
               </BarChart>
             </ResponsiveContainer>
           </div>
           <p className="text-center text-xs text-slate-400 mt-4">Quantity of records per category</p>
        </div>
      </div>
    </div>
  );
};
