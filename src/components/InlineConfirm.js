"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";

/**
 * InlineConfirm — a small confirmation popup that appears near the item being deleted.
 * Replaces browser confirm() dialogs with a styled inline popup.
 *
 * Rendering: portaled to document.body with position:fixed. Coordinates are
 * computed from the parents getBoundingClientRect, then CLAMPED to the
 * nearest <main> elements bounds (with an 8px inset) so the popup always
 * stays within the page content area — never drifts off the page or
 * viewport.
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

    function findMain(el) {
      let node = el;
      while (node && node !== document.body) {
        if (node.tagName === "MAIN") return node;
        node = node.parentElement;
      }
      return null;
    }

    function updatePosition() {
      const rect = parent.getBoundingClientRect();
      const popupWidth = popupRef.current?.offsetWidth || 260;
      const vw = window.innerWidth;

      const main = findMain(parent);
      const mainRect = main ? main.getBoundingClientRect() : null;
      const leftBound = (mainRect ? mainRect.left : 0) + 8;
      const rightBound = (mainRect ? mainRect.right : vw) - 8;

      // Default: popup's right edge aligns with parent's right edge.
      let rightEdge = rect.right;

      // Clamp left: if the popup would extend past the left bound, slide it right.
      const leftEdge = rightEdge - popupWidth;
      if (leftEdge < leftBound) {
        rightEdge = leftBound + popupWidth;
      }

      // Clamp right: if the popup would extend past the right bound, slide it left.
      if (rightEdge > rightBound) {
        rightEdge = rightBound;
      }

      setCoords({ top: rect.bottom + 4, right: vw - rightEdge });
    }

    updatePosition();
    // Re-measure after the popup mounts so we know its real width.
    const raf = requestAnimationFrame(updatePosition);
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      cancelAnimationFrame(raf);
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
