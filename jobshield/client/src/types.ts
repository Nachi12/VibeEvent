export type VerdictType = 'likely_real' | 'suspicious' | 'likely_scam';

export interface RedFlag {
  flag: string;
  evidence_quote: string;
  why_it_matters: string;
  is_exact_quote?: boolean;
}

export interface RuleFlag {
  flag: string;
  matched: boolean;
  evidence_quote: string;
  why_it_matters: string;
  severity: 'high' | 'medium' | 'low';
}

export interface AnalysisResponse {
  verdict: VerdictType;
  score: number; // 0-100: Higher score means greater scam risk
  red_flags: RedFlag[];
  advice: string;
  rule_flags: RuleFlag[];
  analysis_mode: 'ai' | 'rule_only' | 'demo';
  summary?: string;
  metadata?: {
    model?: string;
    checked_at?: string;
    char_count?: number;
  };
}

export interface SampleJob {
  id: string;
  label: string;
  tag: 'Likely Scam' | 'Plausible' | 'Ambiguous' | 'High Risk';
  tagColor: 'red' | 'emerald' | 'amber';
  title: string;
  description: string;
  fullText: string;
}

export interface ReportPayload {
  job_text: string;
  verdict?: VerdictType;
  score?: number;
  category: string;
  reporter_notes?: string;
}

export interface ReportResponse {
  success: boolean;
  report_id: string;
  timestamp: string;
  message: string;
}
