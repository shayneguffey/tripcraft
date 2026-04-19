"use client";

import { useState, useRef, useEffect } from "react";
import { LABEL_MB1 } from "@/lib/detailPaneStyles";

// ─────────────────────────────────────────────────────────────
// EditableNotes — collapsible notes textarea for option details
// ─────────────────────────────────────────────────────────────
// Collapsed when empty (shows "+ Add notes" button).
// Expanded when notes exist or user clicks to add.
// Saves on blur via onSave callback.
//
// Props:
//   notes    — current notes string (or null/empty)
//   onSave   — (newNotes: string) => void
// ─────────────────────────────────────────────────────────────

export default function EditableNotes({ notes, onSave }) {
  const [expanded, setExpanded] = useState(false);
  const [value, setValue] = useState(notes || "");
  const textareaRef = useRef(null);

  // Sync when parent data changes (e.g. after reload)
  useEffect(() => {
    setValue(notes || "");
    if (!notes) setExpanded(false);
  }, [notes]);

  const hasNotes = !!(notes && notes.trim());

  function handleExpand() {
    setExpanded(true);
    // Auto-focus after render
    setTimeout(() => textareaRef.current?.focus(), 0);
  }

  function handleBlur() {
    const trimmed = value.trim();
    // Save if changed
    if (trimmed !== (notes || "").trim()) {
      onSave(trimmed || null);
    }
    // Collapse if empty
    if (!trimmed) {
      setExpanded(false);
    }
  }

  // Collapsed state — just a button
  if (!hasNotes && !expanded) {
    return (
      <div className="mb-4">
        <button
          onClick={handleExpand}
          className="text-xs text-slate-400 hover:text-slate-600 transition-colors flex items-center gap-1"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Add notes
        </button>
      </div>
    );
  }

  // Expanded state — editable textarea
  return (
    <div className="mb-4">
      <div className={LABEL_MB1}>Notes</div>
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={handleBlur}
        rows={3}
        placeholder="Add notes about this option..."
        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:border-transparent resize-y"
      />
    </div>
  );
}
