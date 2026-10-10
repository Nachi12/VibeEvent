import React from 'react';
import { SAMPLE_POSTS } from '../data/samplePosts';
import type { SampleJob } from '../types';
import { FileText, ArrowUpRight } from 'lucide-react';

interface SamplePostsProps {
  onSelectSample: (sample: SampleJob) => void;
  selectedId: string | null;
  disabled?: boolean;
}

export const SamplePosts: React.FC<SamplePostsProps> = ({
  onSelectSample,
  selectedId,
  disabled = false,
}) => {
  return (
    <div className="w-full space-y-3">
      {/* Editorial Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between border-b-2 border-black pb-2.5 gap-1">
        <div className="flex items-center space-x-2.5">
          <span className="text-[11px] font-mono tracking-widest uppercase text-[#F95C4B] font-bold">
            EXHIBIT REPOSITORY
          </span>
          <span className="text-black/30">/</span>
          <span className="font-editorial-serif italic text-sm text-black/80 font-medium">
            Four Control Case Studies for Immediate Forensic Audit
          </span>
        </div>
        <span className="text-[11px] font-mono text-black/60 uppercase tracking-wider">
          Click any exhibit to load into the deposition desk
        </span>
      </div>

      {/* Grid of Exhibits */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {SAMPLE_POSTS.map((sample, idx) => {
          const isSelected = selectedId === sample.id;
          const exhibitNumber = ['EXHIBIT A', 'EXHIBIT B', 'EXHIBIT C', 'EXHIBIT D'][idx] || `EXHIBIT ${idx + 1}`;

          let stampClass = 'border-2 border-black text-black bg-[#E4DED2]';
          if (sample.tagColor === 'red') {
            stampClass = 'border-2 border-[#F95C4B] text-[#F95C4B] bg-[#F95C4B]/10 font-bold';
          } else if (sample.tagColor === 'emerald') {
            stampClass = 'border-2 border-black text-black bg-white font-bold';
          }

          return (
            <button
              key={sample.id}
              type="button"
              id={`btn-${sample.id}`}
              disabled={disabled}
              onClick={() => onSelectSample(sample)}
              className={`p-4 text-left transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed group relative flex flex-col justify-between ${
                isSelected
                  ? 'bg-[#E4DED2]/50 border-2 border-[#F95C4B] shadow-[4px_4px_0px_#F95C4B]'
                  : 'bg-white border-2 border-black shadow-[3px_3px_0px_#000] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[4px_4px_0px_#000]'
              }`}
            >
              <div>
                {/* Exhibit Number & Stamp */}
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-[10px] font-mono font-bold tracking-widest text-black/60 uppercase">
                    {exhibitNumber}
                  </span>
                  <span
                    className={`text-[9px] font-mono px-2 py-0.5 tracking-wider uppercase ${stampClass}`}
                  >
                    {sample.tag}
                  </span>
                </div>

                {/* Title */}
                <h4 className="font-editorial-serif text-base font-bold text-black group-hover:text-[#F95C4B] transition-colors line-clamp-2 mb-1.5 leading-snug">
                  {sample.title}
                </h4>

                {/* Synopsis */}
                <p className="text-xs text-black/70 leading-relaxed line-clamp-3 font-sans mb-3">
                  {sample.description}
                </p>
              </div>

              {/* Action link indicator */}
              <div className="flex items-center justify-between text-[11px] font-mono pt-2 border-t border-black/10 text-black/60 group-hover:text-black mt-2">
                <span className="flex items-center gap-1 text-[10px] font-bold">
                  <FileText className="w-3 h-3 text-black/50" />
                  <span>LOAD TRANSCRIPT</span>
                </span>
                <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform text-[#F95C4B]" />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
