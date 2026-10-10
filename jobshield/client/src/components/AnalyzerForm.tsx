import React from 'react';
import { Loader2, Trash2, Clipboard, ShieldAlert, AlertCircle, Sparkles } from 'lucide-react';

interface AnalyzerFormProps {
  text: string;
  onChangeText: (value: string) => void;
  onAnalyze: () => void;
  onClear: () => void;
  isLoading: boolean;
  error: string | null;
}

export const AnalyzerForm: React.FC<AnalyzerFormProps> = ({
  text,
  onChangeText,
  onAnalyze,
  onClear,
  isLoading,
  error,
}) => {
  const charCount = text.length;
  const minLength = 20;
  const maxLength = 15000;
  const isTooShort = charCount > 0 && charCount < minLength;
  const isTooLong = charCount > maxLength;
  const isValid = charCount >= minLength && !isTooLong;

  const handlePaste = async () => {
    try {
      const clipText = await navigator.clipboard.readText();
      if (clipText) {
        onChangeText(clipText);
      }
    } catch {
      // Ignore clipboard permission failures
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isValid && !isLoading) {
      onAnalyze();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="bg-white border-2 border-black shadow-[5px_5px_0px_#000] relative">
        {/* Folio Header Bar */}
        <div className="flex flex-wrap items-center justify-between px-5 py-3 bg-[#E4DED2] border-b-2 border-black text-xs gap-2">
          <div className="flex items-center space-x-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#F95C4B] animate-pulse" />
            <span className="font-mono text-[11px] font-bold tracking-wider text-black uppercase">
              DOCUMENT DEPOSITION DESK
            </span>
            <span className="text-black/30 hidden sm:inline">•</span>
            <span className="font-editorial-serif italic text-black/80 font-medium hidden sm:inline">
              Paste complete job advertisement, recruiter message, or correspondence
            </span>
          </div>

          <div className="flex items-center space-x-4 text-black font-mono text-[11px]">
            <button
              type="button"
              onClick={handlePaste}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 hover:text-[#F95C4B] transition-colors cursor-pointer uppercase tracking-wider font-semibold"
              title="Paste from clipboard"
            >
              <Clipboard className="w-3.5 h-3.5" />
              <span>Paste Clipboard</span>
            </button>

            {text && (
              <button
                type="button"
                onClick={onClear}
                disabled={isLoading}
                className="inline-flex items-center gap-1.5 text-black/70 hover:text-[#F95C4B] transition-colors cursor-pointer uppercase tracking-wider font-semibold"
                title="Clear input"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            )}

            <span
              className={`tracking-wider font-bold ${
                isTooLong
                  ? 'text-[#F95C4B]'
                  : charCount > 0
                  ? 'text-black'
                  : 'text-black/50'
              }`}
            >
              {charCount} / {maxLength.toLocaleString()} CHARS
            </span>
          </div>
        </div>

        {/* Textarea Area */}
        <div className="relative bg-white">
          <textarea
            id="job-posting-textarea"
            rows={9}
            disabled={isLoading}
            value={text}
            onChange={(e) => onChangeText(e.target.value)}
            placeholder="Paste the raw text of the recruitment notice, LinkedIn posting, Telegram offer, WhatsApp message, or email inquiry here for evidence evaluation..."
            className="w-full px-6 py-5 bg-transparent text-black placeholder-black/40 text-sm md:text-base leading-relaxed focus:outline-none resize-y min-h-[200px] font-mono font-normal disabled:opacity-50 selection:bg-[#F95C4B] selection:text-white"
          />

          {isLoading && (
            <div className="absolute inset-0 bg-[#F6F4F1]/95 border-t border-black flex flex-col items-center justify-center space-y-4 z-10 p-6 text-center">
              <div className="relative flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-[#F95C4B] animate-spin" />
                <Sparkles className="w-4 h-4 text-black absolute" />
              </div>
              <div className="max-w-md">
                <p className="font-editorial-serif text-xl font-bold text-black">
                  Conducting Forensic Synthesis & Citation Audit...
                </p>
                <p className="font-mono text-xs text-black/70 mt-1 uppercase tracking-wider font-semibold">
                  Testing 6 deterministic fraud signatures & cross-examining language model
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Error / Validation Warnings */}
        {error && (
          <div className="px-6 py-3 bg-[#F95C4B]/10 border-t-2 border-[#F95C4B] flex items-center gap-2.5 text-xs text-[#F95C4B] font-mono font-bold">
            <AlertCircle className="w-4 h-4 shrink-0 text-[#F95C4B]" />
            <span>EXAMINATION HALTED: {error}</span>
          </div>
        )}

        {isTooShort && (
          <div className="px-6 py-2.5 bg-[#E4DED2] border-t-2 border-black flex items-center gap-2.5 text-xs text-black font-mono font-semibold">
            <AlertCircle className="w-3.5 h-3.5 shrink-0 text-[#F95C4B]" />
            <span>
              MINIMUM DEPOSITION NOT MET: Enter at least {minLength} characters to establish forensic context (currently {charCount}).
            </span>
          </div>
        )}

        {/* Bottom Submission Strip */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 bg-[#F6F4F1] border-t-2 border-black">
          <div className="flex items-center space-x-2 text-xs font-mono text-black/70 font-semibold">
            <ShieldAlert className="w-4 h-4 text-[#F95C4B] shrink-0" />
            <span className="tracking-wide">
              PROMPT INJECTION DEFENSE ARMED • UNTRUSTED DATA DELIMITED
            </span>
          </div>

          <button
            type="submit"
            id="btn-analyze-job"
            disabled={!isValid || isLoading}
            className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 font-mono font-bold text-xs tracking-widest uppercase transition-all duration-150 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed border-2 border-black ${
              isValid && !isLoading
                ? 'bg-[#F95C4B] hover:bg-[#e04a39] text-white shadow-[3px_3px_0px_#000] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[4px_4px_0px_#000]'
                : 'bg-[#E4DED2] text-black/40'
            }`}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>EXAMINING TRANSCRIPT...</span>
              </>
            ) : (
              <>
                <span>EXAMINE EVIDENCE</span>
                <span className="text-[12px] font-bold">→</span>
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
};
