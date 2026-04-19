"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabase";

export default function PlanningChecklist({ tripId }) {
  const [items, setItems] = useState([]);
  const [newItemText, setNewItemText] = useState("");
  const [loading, setLoading] = useState(true);
  const [addError, setAddError] = useState(null);
  const inputRef = useRef(null);

  const loadItems = useCallback(async () => {
    const { data } = await supabase
      .from("planning_checklist")
      .select("*")
      .eq("trip_id", tripId)
      .order("sort_order", { ascending: true });
    setItems(data || []);
    setLoading(false);
  }, [tripId]);

  useEffect(() => { loadItems(); }, [loadItems]);

  async function addItem(e) {
    e.preventDefault();
    if (!newItemText.trim()) return;
    setAddError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setAddError("Not signed in");
        return;
      }

      const nextOrder = items.length > 0 ? Math.max(...items.map((i) => i.sort_order || 0)) + 1 : 0;

      const { error } = await supabase.from("planning_checklist").insert({
        trip_id: tripId,
        user_id: user.id,
        text: newItemText.trim(),
        is_checked: false,
        sort_order: nextOrder,
      });

      if (error) {
        console.error("Failed to add checklist item:", error);
        setAddError(error.message);
        return;
      }

      setNewItemText("");
      loadItems();
      // Keep focus on input for rapid entry
      setTimeout(() => inputRef.current?.focus(), 50);
    } catch (err) {
      console.error("Unexpected error adding checklist item:", err);
      setAddError(err.message || "Something went wrong");
    }
  }

  async function toggleItem(id, currentState) {
    await supabase.from("planning_checklist").update({ is_checked: !currentState }).eq("id", id);
    setItems((prev) => prev.map((i) => i.id === id ? { ...i, is_checked: !currentState } : i));
  }

  async function deleteItem(id) {
    await supabase.from("planning_checklist").delete().eq("id", id);
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  const checkedCount = items.filter((i) => i.is_checked).length;
  const totalCount = items.length;
  const progressPct = totalCount > 0 ? Math.round((checkedCount / totalCount) * 100) : 0;

  if (loading) return null;

  return (
    <div className="mb-6">
      <div className="bg-white rounded-xl border border-amber-100 shadow-sm overflow-hidden">
        {/* Progress bar */}
        {totalCount > 0 && (
          <div className="h-1.5 bg-amber-50">
            <div
              className="h-full bg-amber-400 transition-all duration-300 rounded-r-full"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        )}

        {/* Items */}
        <div className="divide-y divide-slate-50">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-3 px-4 py-2.5 group hover:bg-slate-50/50 transition-colors"
            >
              {/* Checkbox */}
              <button
                onClick={() => toggleItem(item.id, item.is_checked)}
                className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                  item.is_checked
                    ? "bg-amber-500 border-amber-500"
                    : "border-slate-300 hover:border-amber-400"
                }`}
              >
                {item.is_checked && (
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>

              {/* Text */}
              <span className={`flex-1 text-sm transition-all ${
                item.is_checked ? "line-through text-slate-400" : "text-slate-700"
              }`}>
                {item.text}
              </span>

              {/* Delete */}
              <button
                onClick={() => deleteItem(item.id)}
                className="flex-shrink-0 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>

        {/* Error message */}
        {addError && (
          <div className="px-4 py-2 text-xs text-red-600 bg-red-50 border-t border-red-100">
            Error: {addError}
          </div>
        )}

        {/* Add new item */}
        <form onSubmit={addItem} className="flex items-center gap-2 px-4 py-3 border-t border-slate-100">
          <svg className="w-4 h-4 text-slate-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={newItemText}
            onChange={(e) => setNewItemText(e.target.value)}
            placeholder="Add a task... (e.g. Book airport transfer, Get travel insurance)"
            className="flex-1 text-sm bg-white text-slate-700 placeholder:text-slate-300 px-3 py-2 border border-stone-300 rounded-lg outline-none focus:ring-2 focus:ring-[#da7b4a]/50 focus:border-transparent transition-all"
          />
          {newItemText.trim() && (
            <button
              type="submit"
              className="text-xs font-semibold text-amber-600 hover:text-amber-700 px-2 py-1 rounded-md hover:bg-amber-50 transition-colors"
            >
              Add
            </button>
          )}
        </form>

        {/* Empty state */}
        {totalCount === 0 && (
          <div className="px-4 pb-4 -mt-1">
            <p className="text-xs text-slate-400 italic">Start adding tasks to stay organized — visa applications, bookings to confirm, documents to prepare...</p>
          </div>
        )}
      </div>
    </div>
  );
}
