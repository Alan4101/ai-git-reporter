export interface Commit {
  hash: string;
  summary: string;
  time: string;
  duration: number;
  files: string[];
  analysis?: string;
  isAnalyzing?: boolean;
}

export interface AnalyzeResponse {
  commits: Commit[];
}

export interface AIResponse {
  analysis: string;
}
