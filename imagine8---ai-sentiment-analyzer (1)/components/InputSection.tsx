import React, { useState, useRef, useCallback } from 'react';
import { Upload, FileText, X, Play, Loader2 } from 'lucide-react';

interface InputSectionProps {
  onAnalyze: (texts: string[]) => void;
  isAnalyzing: boolean;
}

export const InputSection: React.FC<InputSectionProps> = ({ onAnalyze, isAnalyzing }) => {
  const [inputText, setInputText] = useState('');
  const [activeTab, setActiveTab] = useState<'text' | 'file'>('text');
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleTextSubmit = () => {
    if (!inputText.trim()) return;
    onAnalyze([inputText]);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      // Simple splitting by newline for TXT/CSV. 
      // In a real app, a proper CSV parser would be used.
      const lines = text
        .split(/\r?\n/)
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .slice(0, 20); // Limit to 20 lines for this demo to avoid token limits
      
      setFileContent(lines);
    };
    reader.readAsText(file);
  };

  const handleFileSubmit = () => {
    if (fileContent.length === 0) return;
    onAnalyze(fileContent);
  };

  const clearFile = () => {
    setFileName(null);
    setFileContent([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('text')}
          className={`flex-1 py-4 text-sm font-medium transition-colors ${
            activeTab === 'text'
              ? 'bg-white text-indigo-600 border-b-2 border-indigo-600'
              : 'bg-slate-50 text-slate-500 hover:text-slate-700'
          }`}
        >
          Direct Text Input
        </button>
        <button
          onClick={() => setActiveTab('file')}
          className={`flex-1 py-4 text-sm font-medium transition-colors ${
            activeTab === 'file'
              ? 'bg-white text-indigo-600 border-b-2 border-indigo-600'
              : 'bg-slate-50 text-slate-500 hover:text-slate-700'
          }`}
        >
          Batch File Upload
        </button>
      </div>

      <div className="p-6">
        {activeTab === 'text' ? (
          <div className="space-y-4">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Enter text to analyze here (e.g. 'I absolutely love this product, it changed my life!')..."
              className="w-full h-32 p-4 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none text-slate-700 placeholder:text-slate-400"
            />
            <div className="flex justify-end">
              <button
                onClick={handleTextSubmit}
                disabled={!inputText.trim() || isAnalyzing}
                className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium shadow-sm"
              >
                {isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
                Analyze Text
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {!fileName ? (
              <div 
                className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:bg-slate-50 transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  type="file"
                  accept=".txt,.csv,.json"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                />
                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Upload className="w-6 h-6" />
                </div>
                <h3 className="text-slate-900 font-medium mb-1">Click to upload file</h3>
                <p className="text-slate-500 text-sm">Supports TXT, CSV, JSON (Max 20 lines for demo)</p>
              </div>
            ) : (
              <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-md shadow-sm text-indigo-600">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">{fileName}</p>
                    <p className="text-xs text-slate-500">{fileContent.length} items detected</p>
                  </div>
                </div>
                <button 
                  onClick={clearFile}
                  className="p-2 hover:bg-indigo-100 rounded-full text-slate-400 hover:text-indigo-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {fileName && (
               <div className="flex justify-end">
               <button
                 onClick={handleFileSubmit}
                 disabled={isAnalyzing}
                 className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium shadow-sm"
               >
                 {isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
                 Process Batch
               </button>
             </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
