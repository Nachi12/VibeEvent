import React, { useState } from 'react';
import type { VerdictType, ReportResponse } from '../types';
import { X, Flag, AlertCircle, CheckCircle2, Loader2, ShieldAlert } from 'lucide-react';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobText: string;
  verdict?: VerdictType;
  score?: number;
  onSubmitReport: (category: string, notes: string) => Promise<ReportResponse>;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  jobText,
  verdict,
  score,
  onSubmitReport,
}) => {
  const [category, setCategory] = useState('Upfront Fee / Security Deposit Extortion');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<ReportResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const categories = [
    'Upfront Fee / Security Deposit Extortion',
    'Telegram / WhatsApp Recruitment Redirection',
    'Impersonation of Established Tech / Corporate Entity',
    'Unrealistic Compensation / Data Entry Phishing',
    'Unverified Entity / Missing Contact Identity',
    'Other Suspicious Recruitment Activity',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await onSubmitReport(category, notes);
      setResult(res);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : 'Failed to file report. Please retry.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetAndClose = () => {
    setResult(null);
    setError(null);
    setNotes('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-xl bg-[#F6F4F1] border-3 border-black shadow-[8px_8px_0px_#000] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#E4DED2] border-b-2 border-black">
          <div className="flex items-center space-x-3">
            <span className="font-mono text-[10px] px-2 py-0.5 border-2 border-[#F95C4B] text-[#F95C4B] bg-white uppercase tracking-widest font-bold">
              SUBPOENA FILING
            </span>
            <h4 className="font-editorial-serif text-xl font-bold text-black">
              Log Suspicious Posting in Repository
            </h4>
          </div>

          <button
            type="button"
            onClick={handleResetAndClose}
            className="p-1 text-black hover:text-[#F95C4B] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Confirmation */}
        {result ? (
          <div className="p-8 space-y-5 text-center">
            <CheckCircle2 className="w-12 h-12 text-black mx-auto" />
            <h4 className="font-editorial-serif text-2xl font-bold text-black">
              Incident Successfully Recorded
            </h4>
            <p className="text-sm text-black/80 max-w-md mx-auto leading-relaxed font-sans font-medium">
              {result.message}
            </p>

            <div className="p-4 bg-[#E4DED2] border-2 border-black font-mono text-xs text-black font-bold">
              CASE TRACKING IDENTIFIER:{' '}
              <span className="text-[#F95C4B] font-extrabold">{result.report_id}</span>
            </div>

            <div className="p-3.5 bg-white border border-black/20 text-[11px] font-mono text-black text-left">
              <strong>HACKATHON RUNTIME NOTICE:</strong> Incidents are recorded in server memory for this session and are not published or persisted across server restarts.
            </div>

            <button
              type="button"
              onClick={handleResetAndClose}
              className="w-full py-3 bg-[#F95C4B] hover:bg-[#e04a39] text-white border-2 border-black font-mono font-bold text-xs uppercase tracking-widest transition-colors cursor-pointer shadow-[3px_3px_0px_#000]"
            >
              RETURN TO DOSSIER
            </button>
          </div>
        ) : (
          /* Form */
          <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-5">
            {error && (
              <div className="p-3 bg-[#F95C4B]/10 border-2 border-[#F95C4B] flex items-center gap-2 text-xs text-[#F95C4B] font-mono font-bold">
                <AlertCircle className="w-4 h-4 shrink-0 text-[#F95C4B]" />
                <span>{error}</span>
              </div>
            )}

            {/* Context snippet */}
            <div className="p-4 bg-[#E4DED2] border-2 border-black space-y-1.5 font-mono text-xs text-black">
              <div className="flex justify-between text-black font-bold">
                <span>ASSOCIATED VERDICT: {verdict ? verdict.toUpperCase() : 'UNSPECIFIED'}</span>
                <span>RISK INDEX: {score ?? 'N/A'}/100</span>
              </div>
              <p className="line-clamp-2 italic font-editorial-serif text-sm text-black/80 font-medium">
                "{jobText.slice(0, 160)}..."
              </p>
            </div>

            {/* Category Select */}
            <div className="space-y-1.5">
              <label
                htmlFor="report-category-select"
                className="block font-mono text-[11px] font-bold text-black uppercase tracking-wider"
              >
                PRIMARY SUSPECT FRAUD MECHANISM
              </label>
              <select
                id="report-category-select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-3 bg-white border-2 border-black text-black text-sm focus:outline-none focus:border-[#F95C4B] font-mono font-medium"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Notes */}
            <div className="space-y-1.5">
              <label
                htmlFor="reporter-notes-textarea"
                className="block font-mono text-[11px] font-bold text-black uppercase tracking-wider"
              >
                FORENSIC NOTES & CORROBORATING DETAILS (OPTIONAL)
              </label>
              <textarea
                id="reporter-notes-textarea"
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="E.g., Recruiter requested UPI transaction, refused Google Meet video verification, or used spoofed email..."
                className="w-full px-4 py-3 bg-white border-2 border-black text-black text-sm focus:outline-none focus:border-[#F95C4B] resize-none font-sans placeholder-black/40 font-medium"
              />
            </div>

            {/* Ethical Notice */}
            <div className="p-3.5 bg-[#E4DED2] border border-black/20 text-[11px] font-mono text-black leading-relaxed flex items-start gap-2 font-medium">
              <ShieldAlert className="w-3.5 h-3.5 text-[#F95C4B] shrink-0 mt-0.5" />
              <span>
                <strong>PRIVACY & ETHICAL PROTOCOL:</strong> Zero personally identifiable applicant data is collected.
                Reports are collected solely to evaluate aggregate fraudulent recruitment patterns.
              </span>
            </div>

            {/* Buttons */}
            <div className="flex items-center justify-end space-x-3 pt-2 font-mono text-xs">
              <button
                type="button"
                onClick={handleResetAndClose}
                disabled={isSubmitting}
                className="px-4 py-2.5 text-black hover:text-[#F95C4B] font-bold transition-colors cursor-pointer uppercase tracking-wider"
              >
                Cancel
              </button>

              <button
                type="submit"
                id="btn-submit-report"
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 px-7 py-3 bg-[#F95C4B] hover:bg-[#e04a39] text-white border-2 border-black font-bold tracking-widest uppercase transition-colors cursor-pointer shadow-[3px_3px_0px_#000] disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>FILING...</span>
                  </>
                ) : (
                  <>
                    <Flag className="w-3.5 h-3.5" />
                    <span>FILE REPORT</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
