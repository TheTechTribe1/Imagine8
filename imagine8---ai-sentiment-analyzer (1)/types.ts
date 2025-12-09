export enum SentimentType {
  POSITIVE = 'Positive',
  NEGATIVE = 'Negative',
  NEUTRAL = 'Neutral',
}

export interface AnalysisResult {
  id: string;
  originalText: string;
  sentiment: SentimentType;
  confidence: number; // 0 to 1
  keywords: string[];
  timestamp: number;
}

export interface BatchAnalysisResponse {
  results: {
    id: string; // Should match input index or ID
    sentiment: SentimentType;
    confidence: number;
    keywords: string[];
  }[];
}

export interface ChartDataPoint {
  name: string;
  value: number;
  fill?: string;
}

export type FileUploadStatus = 'idle' | 'parsing' | 'analyzing' | 'complete' | 'error';
