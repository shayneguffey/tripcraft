"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";

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
 * Rendering: portaled to document.body with position:fixed, coordinates
 * computed from the parent elements getBoundingClientRect. This guarantees
 * the popup is never clipped by ancestor overflow:hidden wrappers or by
 * narrow parents (e.g., a 140-220px itinerary tab).
 */
export default function InlineConfirm({ open, message = "Delete?", onConfirm, onCancel }) {
  const anchorRef = useRef(null);
  const popupRef = useRef(null);
  const [coords, setCoords] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open || !anchorRef.current) return;
    const parent = anchorRef.current.parentElement;
    if (!parent) return;

    function updatePosition() {
      const rect = parent.getBoundingClientRect();
      const popupWidth = popupRef.current?.offsetWidth || 240;
      const viewportWidth = window.innerWidth;
      let right = viewportWidth - rect.right;
      if (rect.right - popupWidth < 8) {
        right = Math.max(8, viewportWidth - (popupWidth + 8));
      }
      setCoords({ top: rect.bottom + 4, right });
    }

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function handleClick(e) {
      if (popupRef.current && !popupRef.current.contains(e.target)) {
        onCancel?.();
      }
    }
    const t = setTimeout(() => {
      document.addEventListener("mousedown", handleClick);
    }, 0);
    return () => {
      clearTimeout(t);
      document.removeEventListener("mousedown", handleClick);
    };
  }, [open, onCancel]);

  if (!open) {
    return <span ref={anchorRef} style={{ display: "none" }} aria-hidden="true" />;
  }

  const popup = coords ? (
    <div
      ref={popupRef}
      className="fixed z-[9999] bg-white rounded-lg shadow-xl border border-stone-200 px-3 py-2.5 flex items-center gap-2 animate-[cardFadeIn_0.15s_ease-out]"
      style={{ top: coords.top, right: coords.right, whiteSpace: "nowrap" }}
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
  ) : null;

  return (
    <>
      <span ref={anchorRef} style={{ display: "none" }} aria-hidden="true" />
      {mounted && popup ? createPortal(popup, document.body) : null}
    </>
  );
}
