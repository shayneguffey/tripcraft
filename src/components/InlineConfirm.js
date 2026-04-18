"use client";

import { useState, useEffect, useRef } from "react";

/**
 * InlineConfirm — a small confirmation popup that appears near the item being deleted.
 * Replaces browser confirm() dialogs with a styled inline popup.
 *
 * Usage:
 *   const [confirmId, setConfirmId] = useState(null);
 *   <InlineConfirm
 *     open={confirmId === item.id}
 *     message="Delete this flight?"
 *     onConfirm={() => { actualDelete(item.id); setConfirmId(null); }}
 *     onCancel={() => setConfirmId(null)}
 *   />
 *
 * Position: renders as an absolutely positioned popup relative to its parent container.
 * Parent should have `position: relative`.
 */
export default function InlineConfirm({ open, message = "Delete?", onConfirm, onCancel }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        onCancel?.();
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div
      ref={ref}
      className="absolute z-50 bg-white rounded-lg shadow-xl border border-stone-200 px-3 py-2.5 flex items-center gap-2 animate-[cardFadeIn_0.15s_ease-out]"
      style={{ right: 0, top: "100%", marginTop: 4, whiteSpace: "nowrap" }}
    >
      <span className="text-xs text-stone-600">{message}</span>
      <button
        onClick={(e) => { e.stopPropagation(); onConfirm?.(); }}
        className="px-2 py-0.5 text-xs font-semibold text-white bg-red-500 rounded hover:bg-red-600 transition-colors"
      >
        Delete
      </button>
      <button
        onClick={(e) => { e.stopPropagation(); onCancel?.(); }}
        className="px-2 py-0.5 text-xs font-semibold text-stone-500 bg-stone-100 rounded hover:bg-stone-200 transition-colors"
      >
        Cancel
      </button>
    </div>
  );
}
