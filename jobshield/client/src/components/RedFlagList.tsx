import React, { useState } from 'react';
import type { RedFlag, RuleFlag } from '../types';
import {
  AlertTriangle,
  Quote,
  Sliders,
  Check,
  FileSearch,
  Cpu,
} from 'lucide-react';

interface RedFlagListProps {
  redFlags: RedFlag[];
  ruleFlags: RuleFlag[];
  analysisMode?: 'ai' | 'rule_only' | 'demo';
}

export const RedFlagList: React.FC<RedFlagListProps> = ({
  redFlags,
  ruleFlags,
  analysisMode = 'rule_only',
}) => {
  const isAiActive = analysisMode === 'ai' && redFlags.length > 0;
  const [activeTab, setActiveTab] = useState<'all' | 'ai' | 'rules'>('all');

  const matchedRuleFlags = ruleFlags.filter((r) => r.matched);

  const getSeverityBadge = (sev: 'high' | 'medium' | 'low') => {
    switch (sev) {
      case 'high':
        return 'border-2 border-[#F95C4B] text-[#F95C4B] bg-[#F95C4B]/10 font-bold';
      case 'medium':
        return 'border-2 border-black text-black bg-[#E4DED2] font-bold';
      case 'low':
      default:
        return 'border-2 border-black text-black bg-white font-bold';
    }
  };

  return (
    <div className="bg-white border-2 border-black shadow-[6px_6px_0px_#000] relative overflow-hidden space-y-0">
      {/* Folio Header & Tab Register */}
      <div className="flex flex-col md:flex-row md:items-center justify-between px-6 md:px-8 py-4 bg-[#E4DED2] border-b-2 border-black gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <span className="font-mono text-xs font-bold uppercase tracking-widest text-[#F95C4B]">
              EXHIBIT CROSS-EXAMINATION
            </span>
            <span className="text-black/30">/</span>
            <span className="font-mono text-xs font-bold text-black uppercase">
              {isAiActive ? 'AI CITATIONS & RULE REGISTER' : 'DETERMINISTIC RULE SIGNATURES'}
            </span>
          </div>
          <p className="font-editorial-serif italic text-xs text-black/80 mt-0.5 font-medium">
            {isAiActive
              ? 'Synthesized language model citations cross-verified against deterministic rule checks'
              : 'Verifiable pattern signatures matched without generative hallucination'}
          </p>
        </div>

        {/* Tab Controls - Transparently adjusted based on whether AI ran */}
        <div className="flex items-center border-2 border-black bg-white p-0.5 font-mono text-[11px]">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 transition-colors cursor-pointer uppercase tracking-wider font-bold ${
              activeTab === 'all'
                ? 'bg-black text-white'
                : 'text-black hover:bg-[#E4DED2]'
            }`}
          >
            All Findings ({isAiActive ? redFlags.length + matchedRuleFlags.length : matchedRuleFlags.length})
          </button>

          {/* Only show AI Citations tab IF Claude Sonnet actually ran! */}
          {isAiActive && (
            <button
              type="button"
              onClick={() => setActiveTab('ai')}
              className={`px-3 py-1.5 transition-colors cursor-pointer uppercase tracking-wider font-bold ${
                activeTab === 'ai'
                  ? 'bg-black text-white'
                  : 'text-black hover:bg-[#E4DED2]'
              }`}
            >
              Claude Citations ({redFlags.length})
            </button>
          )}

          <button
            type="button"
            onClick={() => setActiveTab('rules')}
            className={`px-3 py-1.5 transition-colors cursor-pointer uppercase tracking-wider font-bold ${
              activeTab === 'rules'
                ? 'bg-black text-white'
                : 'text-black hover:bg-[#E4DED2]'
            }`}
          >
            Rule Register ({matchedRuleFlags.length}/{ruleFlags.length})
          </button>
        </div>
      </div>

      {/* Honest Audit Status Bar */}
      <div className="px-6 md:px-8 py-2 bg-[#F6F4F1] border-b border-black/15 flex flex-wrap items-center justify-between text-[11px] font-mono text-black/70">
        <div className="flex items-center space-x-2">
          <Cpu className="w-3.5 h-3.5 text-[#F95C4B]" />
          <span>
            {isAiActive ? (
              <strong className="text-black">ACTIVE ENGINE: Claude Sonnet AI + Deterministic Rules</strong>
            ) : (
              <strong className="text-black">ACTIVE ENGINE: Deterministic Forensic Engine (6 Transparent Rules)</strong>
            )}
          </span>
        </div>

        <span className="text-black/60 italic hidden sm:inline">
          {isAiActive
            ? 'Citations audited word-for-word against submitted deposition'
            : 'Evaluating deterministic keywords, currency patterns, and contact channels'}
        </span>
      </div>

      <div className="p-6 md:p-8 space-y-8">
        {/* Empty State */}
        {(!isAiActive || redFlags.length === 0) && matchedRuleFlags.length === 0 && (
          <div className="p-10 text-center border-2 border-dashed border-black bg-[#F6F4F1] space-y-2">
            <Check className="w-8 h-8 text-black mx-auto" />
            <h4 className="font-editorial-serif text-xl font-bold text-black">
              No Fraudulent Signatures Triggered
            </h4>
            <p className="text-xs text-black/75 max-w-md mx-auto leading-relaxed font-sans font-medium">
              Neither upfront payment demands, unverified off-platform rerouting, nor lookalike recruitment domains
              were detected in the submitted deposition.
            </p>
          </div>
        )}

        {/* AI Model Findings - ONLY RENDER IF AI RAN */}
        {isAiActive && (activeTab === 'all' || activeTab === 'ai') && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b-2 border-black pb-2">
              <span className="font-mono text-xs font-bold uppercase tracking-widest text-black flex items-center gap-2">
                <AlertTriangle className="w-3.5 h-3.5 text-[#F95C4B]" />
                <span>CLAUDE SONNET FORENSIC CITATIONS ({redFlags.length})</span>
              </span>
              <span className="font-mono text-[10px] text-black/60 uppercase tracking-wider font-bold">
                Audited against input text
              </span>
            </div>

            <div className="space-y-4">
              {redFlags.map((flag, idx) => {
                const isExact = flag.is_exact_quote !== false;
                return (
                  <div
                    key={`ai-flag-${idx}`}
                    className="p-5 border-2 border-black bg-[#F6F4F1] space-y-3.5"
                  >
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-xs text-[#F95C4B] font-bold">
                          AI-§{(idx + 1).toString().padStart(2, '0')}
                        </span>
                        <h4 className="font-editorial-serif text-lg font-bold text-black tracking-wide">
                          {flag.flag}
                        </h4>
                      </div>

                      <span
                        className={`text-[9px] font-mono px-2 py-0.5 tracking-wider border-2 uppercase font-bold ${
                          isExact
                            ? 'border-black text-black bg-white'
                            : 'border-[#F95C4B] text-[#F95C4B] bg-[#F95C4B]/10'
                        }`}
                      >
                        {isExact ? 'VERBATIM TRANSCRIPT CITATION' : 'ANALYST OBSERVATION / PARAPHRASE'}
                      </span>
                    </div>

                    {flag.evidence_quote && (
                      <div className="editorial-pullquote pl-6 pr-4 py-3 bg-white border-l-4 border-[#F95C4B] text-black text-base font-editorial-serif font-medium">
                        <Quote className="w-4 h-4 text-[#F95C4B]/40 absolute top-3 right-3" />
                        <span>"{flag.evidence_quote}"</span>
                      </div>
                    )}

                    <div className="text-xs text-black bg-[#E4DED2]/60 p-3 border border-black/15 space-y-1 font-sans">
                      <span className="font-mono text-[10px] uppercase tracking-wider text-black font-bold block">
                        FORENSIC RATIONALE:
                      </span>
                      <p className="leading-relaxed text-black/85 font-medium">{flag.why_it_matters}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Deterministic Rule Register */}
        {(activeTab === 'all' || activeTab === 'rules') && (
          <div className="space-y-4 pt-1">
            <div className="flex items-center justify-between border-b-2 border-black pb-2">
              <span className="font-mono text-xs font-bold uppercase tracking-widest text-black flex items-center gap-2">
                <Sliders className="w-3.5 h-3.5 text-[#F95C4B]" />
                <span>
                  DETERMINISTIC SIGNATURE REGISTER ({matchedRuleFlags.length} MATCHED /{' '}
                  {ruleFlags.length} AUDITED)
                </span>
              </span>
              <span className="font-mono text-[10px] text-black/60 uppercase tracking-wider font-bold">
                Deterministic regex & threshold signatures
              </span>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {ruleFlags.map((rule, idx) => (
                <div
                  key={`rule-item-${idx}`}
                  className={`p-4 border-2 border-black transition-colors ${
                    rule.matched
                      ? 'bg-white shadow-[2px_2px_0px_#000]'
                      : 'bg-[#F6F4F1] opacity-75'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-[10px] text-black/60 font-bold">
                        RULE {(idx + 1).toString().padStart(2, '0')}
                      </span>
                      <span className="text-black/30">•</span>
                      <h5 className="font-editorial-serif text-base font-bold text-black">
                        {rule.flag}
                      </h5>
                    </div>

                    <div>
                      {rule.matched ? (
                        <span
                          className={`font-mono text-[9px] px-2 py-0.5 tracking-wider uppercase ${getSeverityBadge(
                            rule.severity
                          )}`}
                        >
                          {rule.severity} RISK WEIGHT
                        </span>
                      ) : (
                        <span className="font-mono text-[9px] px-2 py-0.5 tracking-wider uppercase border-2 border-black text-black bg-[#E4DED2] font-bold">
                          SIGNATURE NOT DETECTED
                        </span>
                      )}
                    </div>
                  </div>

                  {rule.matched && rule.evidence_quote && (
                    <div className="font-mono text-xs text-[#F95C4B] pl-3 border-l-3 border-[#F95C4B] my-2 italic font-semibold">
                      Matched Text Excerpt: "{rule.evidence_quote}"
                    </div>
                  )}

                  <p className="text-xs text-black/80 leading-relaxed font-sans font-medium">
                    {rule.why_it_matters}
                  </p>
                </div>
              ))}
            </div>

            {/* Editorial Methodology Footnote */}
            <div className="p-3.5 border-2 border-black bg-[#E4DED2] text-[11px] font-mono text-black flex items-start gap-2 font-medium">
              <FileSearch className="w-3.5 h-3.5 text-black shrink-0 mt-0.5" />
              <span>
                <strong>METHODOLOGICAL NOTE:</strong> "Signature Not Detected" reflects the absence of deterministic keyword patterns in the submitted text. Always perform corroborating company registry due diligence.
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
