import React from 'react';
import type { AnalysisResponse, VerdictType } from '../types';
import { ShieldAlert, ShieldCheck, AlertTriangle, Flag, Cpu, HelpCircle } from 'lucide-react';

interface VerdictCardProps {
  result: AnalysisResponse;
  onOpenReport: () => void;
}

export const VerdictCard: React.FC<VerdictCardProps> = ({ result, onOpenReport }) => {
  const { verdict, score, advice, analysis_mode, summary } = result;

  const getVerdictEditorialConfig = (v: VerdictType) => {
    switch (v) {
      case 'likely_scam':
        return {
          title: 'Classification: Elevated Risk — Fraud Signals Detected',
          stampText: 'HIGH RISK / FRAUD SIGNALS',
          stampClass: 'border-2 border-[#F95C4B] text-[#F95C4B] bg-[#F95C4B]/10 font-bold',
          accentHeaderBg: 'bg-[#F95C4B]/10',
          barColor: 'bg-[#F95C4B]',
          icon: <ShieldAlert className="w-7 h-7 text-[#F95C4B] shrink-0" />,
          fallbackSummary:
            'Critical fraud indicators identified. The text contains upfront payment requests or routes candidates through unmonitored channels, violating standard recruitment practices.',
        };
      case 'suspicious':
        return {
          title: 'Classification: Questionable Recruitment Anomalies',
          stampText: 'AMBIGUOUS / CAUTION ADVISED',
          stampClass: 'border-2 border-black text-black bg-[#E4DED2] font-bold',
          accentHeaderBg: 'bg-[#E4DED2]',
          barColor: 'bg-[#F95C4B]/80',
          icon: <AlertTriangle className="w-7 h-7 text-black shrink-0" />,
          fallbackSummary:
            'Multiple irregular signals detected. Public webmail, vague company identity, or unverified contact channels warrant due diligence before sharing personal details.',
        };
      case 'likely_real':
      default:
        return {
          title: 'Classification: Plausible Recruitment Pattern',
          stampText: 'PLAUSIBLE / LOW RISK MARKERS',
          stampClass: 'border-2 border-black text-black bg-white font-bold',
          accentHeaderBg: 'bg-white',
          barColor: 'bg-black',
          icon: <ShieldCheck className="w-7 h-7 text-black shrink-0" />,
          fallbackSummary:
            'No standard fraud signatures, payment demands, or unverified off-platform rerouting detected in this posting text.',
        };
    }
  };

  const config = getVerdictEditorialConfig(verdict);
  const activeSummary = summary && summary.trim().length > 0 ? summary : config.fallbackSummary;

  const getModeLabel = () => {
    if (analysis_mode === 'ai') {
      return {
        label: 'ANTHROPIC CLAUDE SONNET AUDIT',
        color: 'border-2 border-black text-black bg-white',
      };
    }
    if (analysis_mode === 'rule_only') {
      return {
        label: 'DETERMINISTIC RULE ENGINE',
        color: 'border-2 border-black text-black bg-[#E4DED2]',
      };
    }
    return {
      label: 'DETERMINISTIC DEMO ENGINE',
      color: 'border-2 border-black text-black bg-[#E4DED2]',
    };
  };

  const mode = getModeLabel();

  return (
    <div className="bg-white border-2 border-black shadow-[6px_6px_0px_#000] relative overflow-hidden">
      {/* Editorial Folio Masthead for the Finding */}
      <div className={`px-6 md:px-8 py-5 border-b-2 border-black ${config.accentHeaderBg}`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className={`text-[10px] font-mono px-2.5 py-0.5 tracking-wider uppercase ${config.stampClass}`}>
                {config.stampText}
              </span>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 font-mono text-[10px] font-bold tracking-wider uppercase ${mode.color}`}>
                <Cpu className="w-3 h-3 text-[#F95C4B]" />
                <span>{mode.label}</span>
              </span>
            </div>

            <h3 className="font-editorial-serif text-2xl sm:text-3xl font-bold text-black tracking-tight leading-tight">
              {config.title}
            </h3>
          </div>

          <button
            type="button"
            id="btn-report-posting"
            onClick={onOpenReport}
            className="self-start md:self-center inline-flex items-center gap-2 px-4 py-2.5 border-2 border-black bg-white hover:bg-black hover:text-white text-black text-xs font-mono font-bold tracking-wider transition-colors cursor-pointer shadow-[2px_2px_0px_#000]"
          >
            <Flag className="w-3.5 h-3.5 text-[#F95C4B]" />
            <span>LOG ANOMALY / REPORT</span>
          </button>
        </div>
      </div>

      {/* Calibration Scale & Analysis Details */}
      <div className="p-6 md:p-8 space-y-6">
        {/* Risk Calibration Meter Box */}
        <div className="p-5 bg-[#F6F4F1] border-2 border-black space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
            <div className="flex items-baseline space-x-2">
              <span className="font-mono text-xs uppercase tracking-widest text-black/70 font-bold">
                SCAM RISK INDEX:
              </span>
              <span className="font-editorial-display text-4xl font-bold text-[#F95C4B] tracking-tight">
                {score}
              </span>
              <span className="font-mono text-xs text-black/60 font-bold">/ 100</span>
            </div>

            <div className="flex items-center space-x-1.5 font-mono text-[11px] text-black font-semibold">
              <HelpCircle className="w-3.5 h-3.5 text-[#F95C4B]" />
              <span>
                <strong>ORIENTATION NOTICE:</strong> Higher index = Greater risk of fraud.
              </span>
            </div>
          </div>

          {/* Bar */}
          <div className="w-full bg-[#E4DED2] h-3.5 overflow-hidden border-2 border-black p-0.5">
            <div
              className={`h-full transition-all duration-700 ease-out ${config.barColor}`}
              style={{ width: `${Math.min(Math.max(score, 4), 100)}%` }}
            />
          </div>

          {/* Scale Labels */}
          <div className="flex justify-between font-mono text-[10px] text-black font-bold uppercase tracking-widest pt-1">
            <span className="text-black/80">00–30 (LOW RISK / PLAUSIBLE)</span>
            <span className="text-black/80">31–65 (MODERATE / AMBIGUOUS)</span>
            <span className="text-[#F95C4B]">66–100 (HIGH RISK / FRAUD SIGNALS)</span>
          </div>
        </div>

        {/* Dynamic Case Narrative Strictly Derived from Evidence */}
        <div className="border-l-4 border-black pl-5 py-1">
          <span className="font-mono text-[10px] uppercase tracking-wider text-black/60 font-bold block mb-1">
            FORENSIC FINDING NARRATIVE:
          </span>
          <p className="font-editorial-serif text-lg sm:text-xl text-black leading-relaxed italic font-medium">
            "{activeSummary}"
          </p>
        </div>

        {/* Action Directive Callout */}
        {advice && (
          <div className="p-5 bg-[#E4DED2] border-2 border-black space-y-2">
            <div className="font-mono text-[11px] uppercase tracking-widest text-black font-bold flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#F95C4B]" />
              <span>RECOMMENDED DUE DILIGENCE DIRECTIVE</span>
            </div>
            <p className="font-sans text-sm text-black leading-relaxed font-medium">
              {advice}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
