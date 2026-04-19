"use client";

import { useState } from "react";

// ─────────────────────────────────────────────────────────────
// SourceThumbnails — Expandable source material section
// ─────────────────────────────────────────────────────────────
// A single "Sources" button that un-collapses a row of thumbnails.
// Each thumbnail represents a source type:
//   - screenshot: actual image thumbnail, click opens full-size
//   - url: link icon thumbnail, click opens link directly
//   - manual: form icon thumbnail (only if no screenshot/URL), click opens popup
// ─────────────────────────────────────────────────────────────

export default function SourceThumbnails({ screenshotUrl, sourceUrl, manualData, accentColor = "slate" }) {
  const [expanded, setExpanded] = useState(false);
  const [showManualPopup, setShowManualPopup] = useState(false);

  // Only show manual entry source when no screenshot or URL source exists
  const isManualSource = !screenshotUrl && !sourceUrl && manualData && manualData.length > 0;

  const hasSources = screenshotUrl || sourceUrl || isManualSource;
  if (!hasSources) return null;

  const accentHover = {
    emerald: "hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200",
    orange: "hover:bg-orange-50 hover:text-orange-700 hover:border-orange-200",
    yellow: "hover:bg-yellow-50 hover:text-yellow-700 hover:border-yellow-200",
    violet: "hover:bg-violet-50 hover:text-violet-700 hover:border-violet-200",
    sky: "hover:bg-sky-50 hover:text-sky-700 hover:border-sky-200",
    slate: "hover:bg-slate-100 hover:text-slate-700 hover:border-slate-300",
  }[accentColor] || "hover:bg-slate-100 hover:text-slate-700 hover:border-slate-300";

  return (
    <div className="mt-4 pt-4 border-t border-slate-100">
      {/* Toggle button */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors inline-flex items-center gap-1.5"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
        </svg>
        Sources
        <svg className={`w-3 h-3 transition-transform ${expanded ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Expanded thumbnails row */}
      {expanded && (
        <div className="mt-3 flex gap-3 flex-wrap">
          {/* Screenshot thumbnail */}
          {screenshotUrl && (
            <div
              className={`w-24 h-20 rounded-lg border border-slate-200 overflow-hidden cursor-pointer transition-all ${accentHover} group`}
              onClick={() => {
                const w = window.open();
                w.document.write(`<img src="${screenshotUrl}" style="max-width:100%;margin:20px auto;display:block;">`);
              }}
              title="Click to view full screenshot"
            >
              <img
                src={screenshotUrl}
                alt="Screenshot"
                className="w-full h-full object-cover group-hover:opacity-90 transition-opacity"
              />
            </div>
          )}

          {/* URL source thumbnail — opens link directly */}
          {sourceUrl && (
            <a
              href={sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`w-24 h-20 rounded-lg border border-slate-200 bg-slate-50 cursor-pointer transition-all ${accentHover} flex flex-col items-center justify-center gap-1 group`}
              title={sourceUrl}
            >
              <svg className="w-6 h-6 text-slate-400 group-hover:text-current transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
              </svg>
              <span className="text-[9px] font-medium text-slate-400 group-hover:text-current uppercase tracking-wide">URL</span>
            </a>
          )}

          {/* Manual entry thumbnail — only when no screenshot/URL source */}
          {isManualSource && (
            <div className="relative">
              <div
                className={`w-24 h-20 rounded-lg border border-slate-200 bg-slate-50 cursor-pointer transition-all ${accentHover} flex flex-col items-center justify-center gap-1 group`}
                onClick={() => setShowManualPopup(!showManualPopup)}
                title="View manually entered data"
              >
                <svg className="w-6 h-6 text-slate-400 group-hover:text-current transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                </svg>
                <span className="text-[9px] font-medium text-slate-400 group-hover:text-current uppercase tracking-wide">Manual</span>
              </div>

              {/* Manual data popup */}
              {showManualPopup && (
                <div className="absolute bottom-full left-0 mb-2 bg-white rounded-lg shadow-xl border border-slate-200 p-4 z-30 w-72 max-h-64 overflow-y-auto">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Manual Entry</span>
                    <button onClick={() => setShowManualPopup(false)} className="text-slate-400 hover:text-slate-600 text-sm">×</button>
                  </div>
                  <div className="space-y-2">
                    {manualData.map(({ label, value }, i) => (
                      value ? (
                        <div key={i}>
                          <div className="text-[10px] text-slate-400 uppercase tracking-wide">{label}</div>
                          <div className="text-sm text-slate-700">{value}</div>
                        </div>
                      ) : null
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
