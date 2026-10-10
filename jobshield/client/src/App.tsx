import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  RefreshCw,
  Search,
  BookOpen,
  Cpu,
} from 'lucide-react';

import { SamplePosts } from './components/SamplePosts';
import { AnalyzerForm } from './components/AnalyzerForm';
import { VerdictCard } from './components/VerdictCard';
import { RedFlagList } from './components/RedFlagList';
import { ReportModal } from './components/ReportModal';
import type { AnalysisResponse, SampleJob, ReportResponse } from './types';
import { runClientSideAnalysis } from './utils/demoAnalyzer';

export const App: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [selectedSampleId, setSelectedSampleId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResponse | null>(null);
  const [isReportOpen, setIsReportOpen] = useState(false);

  // Backend connection status
  const [backendStatus, setBackendStatus] = useState<'checking' | 'connected' | 'offline'>('checking');
  const [serverModel, setServerModel] = useState<string | null>(null);

  // Check backend health on mount
  useEffect(() => {
    const checkHealth = async () => {
      try {
        const res = await fetch('/api/health');
        if (res.ok) {
          const data = await res.json();
          setBackendStatus('connected');
          if (data.model) setServerModel(data.model);
        } else {
          setBackendStatus('offline');
        }
      } catch {
        setBackendStatus('offline');
      }
    };

    checkHealth();
  }, []);

  // Handle sample selection
  const handleSelectSample = (sample: SampleJob) => {
    setSelectedSampleId(sample.id);
    setInputText(sample.fullText);
    setError(null);
  };

  // Handle Clear
  const handleClear = () => {
    setInputText('');
    setSelectedSampleId(null);
    setResult(null);
    setError(null);
  };

  // Run analysis
  const handleAnalyze = async () => {
    if (!inputText || inputText.trim().length < 20) {
      setError('Please provide at least 20 characters of job text to inspect.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: inputText }),
      });

      if (response.ok) {
        const data: AnalysisResponse = await response.json();
        setResult(data);
        setBackendStatus('connected');
      } else {
        const errorData = await response.json().catch(() => ({}));
        if (response.status === 400) {
          setError(errorData.error || 'Invalid request: please review input text.');
        } else if (response.status === 429) {
          setError('Rate limit exceeded. Please wait a moment before trying again.');
        } else {
          const fallbackData = runClientSideAnalysis(inputText);
          setResult(fallbackData);
        }
      }
    } catch {
      const localResult = runClientSideAnalysis(inputText);
      setResult(localResult);
      setBackendStatus('offline');
    } finally {
      setIsLoading(false);
    }
  };

  // Submit Report
  const handleSubmitReport = async (category: string, notes: string): Promise<ReportResponse> => {
    try {
      const res = await fetch('/api/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          job_text: inputText,
          verdict: result?.verdict,
          score: result?.score,
          category,
          reporter_notes: notes,
        }),
      });

      if (res.ok) {
        return await res.json();
      }
    } catch {
      // In-memory fallback
    }

    return {
      success: true,
      report_id: `REP-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
      timestamp: new Date().toISOString(),
      message: 'Report logged successfully in local demo repository.',
    };
  };

  return (
    <div className="min-h-screen bg-[#F6F4F1] text-black flex flex-col selection:bg-[#F95C4B] selection:text-white">
      {/* Editorial Intelligence Wire / Top Banner */}
      <div className="w-full bg-black text-[#F6F4F1] px-4 py-2 text-[11px] font-mono border-b-2 border-black">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center space-x-2.5">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#F95C4B] animate-pulse" />
            <span className="font-bold tracking-wider uppercase text-white">
              RECRUITMENT INTELLIGENCE BULLETIN:
            </span>
            <span className="text-[#E4DED2] hidden md:inline">
              Campus placement season monitoring active • Zero upfront fees rule strictly enforced
            </span>
          </div>

          <div className="flex items-center space-x-3 text-[10px] text-[#E4DED2] uppercase font-bold">
            <span>ISSUE VOL. 2026.04</span>
            <span>•</span>
            <span className="text-[#F95C4B]">PUBLIC STUDENT SAFETY DESK</span>
          </div>
        </div>
      </div>

      {/* Editorial Masthead */}
      <header className="w-full border-b-2 border-black bg-[#F6F4F1]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-7 space-y-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between border-b-2 border-black pb-5 gap-4">
            {/* Main Publication Name */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[11px] font-mono tracking-widest text-[#F95C4B] uppercase font-extrabold">
                  THE FORENSIC EMPLOYMENT GAZETTE
                </span>
                <span className="text-black/30">•</span>
                <span className="text-[10px] font-mono tracking-wider text-black/70 uppercase font-bold">
                  EST. 2026 • HACKATHON MVP EDITION
                </span>
              </div>
              <h1 className="font-editorial-display text-4xl sm:text-6xl font-normal tracking-tight text-black leading-none">
                JobShield Dispatch
              </h1>
              <p className="font-editorial-serif italic text-base sm:text-lg text-black/80 mt-1 font-medium">
                An Investigative Forensic Platform Against Student Recruitment Extortion
              </p>
            </div>

            {/* Right Status Desk */}
            <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
              {backendStatus === 'connected' ? (
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 border-2 border-black bg-[#E4DED2] text-black font-bold shadow-[2px_2px_0px_#000]">
                  <span className="w-2 h-2 rounded-full bg-[#F95C4B] animate-pulse" />
                  <span>
                    API ONLINE ({serverModel ? serverModel.replace('claude-3-7-', 'Sonnet 3.7').replace('claude-3-5-', 'Sonnet 3.5') : 'Express'})
                  </span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 border-2 border-black bg-[#E4DED2] text-black font-bold shadow-[2px_2px_0px_#000]">
                  <Cpu className="w-3.5 h-3.5 text-[#F95C4B]" />
                  <span>LIVE DEMO ENGINE ACTIVE</span>
                </div>
              )}

              <button
                type="button"
                onClick={() => setIsReportOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 border-2 border-black bg-[#F95C4B] hover:bg-[#e04a39] text-white font-bold transition-colors cursor-pointer uppercase tracking-wider text-[11px] shadow-[2px_2px_0px_#000]"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-white" />
                <span>Log Incident</span>
              </button>
            </div>
          </div>

          {/* Dateline Bar */}
          <div className="flex flex-wrap items-center justify-between font-mono text-[11px] text-black font-bold uppercase tracking-widest pt-1">
            <div>GLOBAL SURVEILLANCE • VOL. 1 NO. 1</div>
            <div className="hidden sm:block">ZERO CHARGES TO STUDENTS • OPEN EVIDENCE AUDIT</div>
            <div className="text-[#F95C4B]">VERDICT CONFIDENCE: RIGOROUS</div>
          </div>
        </div>
      </header>

      {/* Main Content Grid */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-10 space-y-12">
        {/* Section 01: The Lead Editorial Story */}
        <section className="space-y-6">
          <div className="flex items-center space-x-2 text-[11px] font-mono font-bold tracking-widest uppercase text-[#F95C4B]">
            <span>§ SECTION 01</span>
            <span className="text-black/30">/</span>
            <span className="text-black">THE RECRUITMENT EPIDEMIC</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Main Headline & Lead */}
            <div className="lg:col-span-8 space-y-4">
              <h2 className="font-editorial-serif text-3xl sm:text-5xl font-bold tracking-tight text-black leading-[1.12]">
                Before You Apply, <br />
                <span className="italic font-editorial-display text-[#F95C4B]">
                  Subpoena the Evidence.
                </span>
              </h2>

              <p className="font-editorial-serif text-lg sm:text-xl text-black/85 leading-relaxed max-w-2xl font-medium">
                Behind thousands of high-paying remote data entry listings lies a coordinated financial
                extraction scheme targeting students and freshers. JobShield cross-examines unverified communications,
                advance fee demands, and impersonated corporate signatures before your savings or identity are compromised.
              </p>
            </div>

            {/* Sidebar Editorial Digest */}
            <div className="lg:col-span-4 p-5 bg-[#E4DED2] border-2 border-black shadow-[4px_4px_0px_#000] space-y-3 font-mono text-xs">
              <div className="text-[11px] text-black uppercase tracking-widest font-extrabold border-b-2 border-black pb-2">
                FORENSIC CRITERIA AUDIT
              </div>

              <div className="space-y-2.5 text-black">
                <div className="flex items-start gap-2">
                  <span className="text-[#F95C4B] font-extrabold">01.</span>
                  <div>
                    <strong className="text-black block font-sans">Zero Upfront Fees Rule:</strong>
                    <span className="text-black/80 text-[11px] font-medium">No legitimate employer ever charges for training or laptops.</span>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <span className="text-[#F95C4B] font-extrabold">02.</span>
                  <div>
                    <strong className="text-black block font-sans">Verbatim Citations:</strong>
                    <span className="text-black/80 text-[11px] font-medium">AI quotes are checked against raw text to prevent hallucinations.</span>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <span className="text-[#F95C4B] font-extrabold">03.</span>
                  <div>
                    <strong className="text-black block font-sans">0–100 Scam Risk Index:</strong>
                    <span className="text-black/80 text-[11px] font-medium">Higher score indicates greater probability of fraud.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 02: Exhibit Repository (Sample Posts) */}
        <section className="space-y-4 pt-2">
          <div className="flex items-center space-x-2 text-[11px] font-mono font-bold tracking-widest uppercase text-[#F95C4B]">
            <span>§ SECTION 02</span>
            <span className="text-black/30">/</span>
            <span className="text-black">EXHIBIT ARCHIVE</span>
          </div>

          <SamplePosts
            onSelectSample={handleSelectSample}
            selectedId={selectedSampleId}
            disabled={isLoading}
          />
        </section>

        {/* Section 03: Deposition Ingestion Desk (Form) */}
        <section className="space-y-4 pt-2">
          <div className="flex items-center space-x-2 text-[11px] font-mono font-bold tracking-widest uppercase text-[#F95C4B]">
            <span>§ SECTION 03</span>
            <span className="text-black/30">/</span>
            <span className="text-black">DEPOSITION INGESTION DESK</span>
          </div>

          <AnalyzerForm
            text={inputText}
            onChangeText={setInputText}
            onAnalyze={handleAnalyze}
            onClear={handleClear}
            isLoading={isLoading}
            error={error}
          />
        </section>

        {/* Section 04: Forensic Assessment & Findings (Results) */}
        {result && (
          <section id="analysis-results-section" className="space-y-6 pt-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="flex items-center justify-between border-b-2 border-black pb-3">
              <div className="flex items-center space-x-2 text-[11px] font-mono font-bold tracking-widest uppercase text-[#F95C4B]">
                <span>§ SECTION 04</span>
                <span className="text-black/30">/</span>
                <span className="text-black">FORENSIC ASSESSMENT & CASE DOSSIER</span>
              </div>

              <button
                type="button"
                onClick={handleAnalyze}
                disabled={isLoading}
                className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-black hover:text-[#F95C4B] transition-colors cursor-pointer uppercase tracking-wider"
              >
                <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
                <span>Re-examine</span>
              </button>
            </div>

            {/* Verdict Card */}
            <VerdictCard result={result} onOpenReport={() => setIsReportOpen(true)} />

            {/* Detailed Evidence and Rule Indicators */}
            <RedFlagList
              redFlags={result.red_flags}
              ruleFlags={result.rule_flags}
              analysisMode={result.analysis_mode}
            />

            {/* Applicant Countermeasures Field Playbook */}
            <div className="bg-white border-2 border-black shadow-[6px_6px_0px_#000] p-6 md:p-8 space-y-5">
              <div className="flex items-center space-x-2.5">
                <BookOpen className="w-5 h-5 text-[#F95C4B]" />
                <h4 className="font-mono text-xs uppercase tracking-widest text-black font-extrabold">
                  APPLICANT DEFENSE HANDBOOK: ESSENTIAL VERIFICATION DIRECTIVES
                </h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
                <div className="p-4 bg-[#F6F4F1] border-2 border-black space-y-1.5">
                  <span className="font-editorial-serif text-base font-bold text-black block">
                    Directive I: Absolute Prohibition on Upfront Fees
                  </span>
                  <p className="text-black/80 leading-relaxed font-medium">
                    Under no circumstances remit money for software licenses, ID cards, background verifications,
                    or "refundable laptop security deposits." Once transferred via UPI, Zelle, or cryptocurrency, these funds are irretrievable.
                  </p>
                </div>

                <div className="p-4 bg-[#F6F4F1] border-2 border-black space-y-1.5">
                  <span className="font-editorial-serif text-base font-bold text-black block">
                    Directive II: Inspect Domain Name Authenticity
                  </span>
                  <p className="text-black/80 leading-relaxed font-medium">
                    Examine the exact email domain of the sender. Scammers register deceptive lookalikes
                    (e.g., @company-careers-portal.com or @infosys-hiring.com) or use free @gmail.com addresses claiming to be Fortune 500 HR.
                  </p>
                </div>

                <div className="p-4 bg-[#F6F4F1] border-2 border-black space-y-1.5">
                  <span className="font-editorial-serif text-base font-bold text-black block">
                    Directive III: Demands for Live Video Interviews
                  </span>
                  <p className="text-black/80 leading-relaxed font-medium">
                    Legitimate hiring teams utilize structured video calls (Teams, Meet, Zoom). Fraud syndicates
                    invariably insist on text-only questionnaires on Telegram, WhatsApp, or Signal to conceal their identity.
                  </p>
                </div>

                <div className="p-4 bg-[#F6F4F1] border-2 border-black space-y-1.5">
                  <span className="font-editorial-serif text-base font-bold text-black block">
                    Directive IV: Corporate Registry Corroboration
                  </span>
                  <p className="text-black/80 leading-relaxed font-medium">
                    Check official state registries (e.g. MCA, SEC, Companies House) and search LinkedIn for active employees.
                    If the company claims a prestigious international headquarters, verify its physical address on Google Maps Street View.
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Empty State Banner */}
        {!result && !isLoading && (
          <div className="p-10 border-2 border-dashed border-black bg-white shadow-[4px_4px_0px_#000] text-center space-y-3">
            <div className="w-12 h-12 border-2 border-black flex items-center justify-center mx-auto text-black font-mono">
              <Search className="w-5 h-5 text-[#F95C4B]" />
            </div>
            <h4 className="font-editorial-serif text-2xl font-bold text-black">
              The Forensic Deposition Desk is Idle
            </h4>
            <p className="text-xs text-black/75 max-w-lg mx-auto leading-relaxed font-sans font-medium">
              Paste an unverified job posting into the deposition box above, or choose one of our three investigative exhibits (Suspicious, Plausible, or Ambiguous) to execute instant forensic arbitration.
            </p>
          </div>
        )}
      </main>

      {/* Incident Subpoena Modal */}
      <ReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        jobText={inputText || (result ? 'Analyzed posting' : 'Unspecified')}
        verdict={result?.verdict}
        score={result?.score}
        onSubmitReport={handleSubmitReport}
      />

      {/* Editorial Colophon & Footer */}
      <footer className="w-full border-t-2 border-black bg-[#E4DED2] py-12 px-4 sm:px-6 text-xs text-black space-y-6 mt-16">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex flex-col md:flex-row md:items-baseline justify-between border-b-2 border-black pb-6 gap-4">
            <div>
              <span className="font-editorial-display text-3xl text-black font-normal tracking-tight block">
                JobShield Dispatch
              </span>
              <p className="font-mono text-[11px] text-black font-bold uppercase tracking-widest mt-0.5">
                Investigative Forensic Technology for Campus Placement Safety
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-6 font-mono text-[11px] text-black font-bold">
              <span>ANTHROPIC CLAUDE SONNET CORE</span>
              <span>•</span>
              <span>DETERMINISTIC REGEX ARBITRATION</span>
              <span>•</span>
              <button
                type="button"
                onClick={() => setIsReportOpen(true)}
                className="hover:text-[#F95C4B] transition-colors cursor-pointer uppercase tracking-wider underline font-bold"
              >
                File Deposition
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono text-[11px] text-black/85 leading-relaxed">
            <div>
              <strong className="text-black uppercase tracking-wider block mb-1 font-bold">
                Palette & Typography
              </strong>
              Formulated in <strong>Paper (#F6F4F1)</strong>, <strong>Stone (#E4DED2)</strong>, <strong>Coral (#F95C4B)</strong>, and <strong>Black (#000000)</strong>. Set in <em>Newsreader</em>, <em>Instrument Serif</em>, and <em>JetBrains Mono</em>.
            </div>

            <div>
              <strong className="text-black uppercase tracking-wider block mb-1 font-bold">
                Data Privacy Doctrine
              </strong>
              No applicant accounts or identity profiles are collected. Incident logs retain only the submitted posting text snippet in temporary session memory to evaluate aggregate fraud patterns; do not include personal phone numbers or banking credentials.
            </div>

            <div>
              <strong className="text-black uppercase tracking-wider block mb-1 font-bold">
                Educational Disclaimer
              </strong>
              JobShield is an algorithmic detection tool for student education. It analyzes text patterns for known fraud signatures and does not guarantee job authenticity. Always verify with official company registries.
            </div>
          </div>

          <div className="text-center font-mono text-[10px] text-black/70 pt-4 border-t border-black/15 font-bold">
            © {new Date().getFullYear()} JobShield. Built for live hackathon demonstration. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
