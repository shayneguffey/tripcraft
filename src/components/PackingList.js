"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabase";

// ── Packing list categories ──
const CATEGORIES = {
  clothing: { label: "Clothing", icon: "\ud83d\udc55", color: "bg-blue-50 text-blue-700 border-blue-200" },
  toiletries: { label: "Toiletries", icon: "\ud83e\uddf4", color: "bg-pink-50 text-pink-700 border-pink-200" },
  electronics: { label: "Electronics", icon: "\ud83d\udd0c", color: "bg-violet-50 text-violet-700 border-violet-200" },
  documents: { label: "Documents", icon: "\ud83d\udcc4", color: "bg-amber-50 text-amber-700 border-amber-200" },
  health: { label: "Health & Meds", icon: "\ud83d\udc8a", color: "bg-red-50 text-red-700 border-red-200" },
  accessories: { label: "Accessories", icon: "\ud83d\udc5c", color: "bg-teal-50 text-teal-700 border-teal-200" },
  gear: { label: "Gear & Equipment", icon: "\ud83c\udfd5\ufe0f", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  snacks: { label: "Snacks & Drinks", icon: "\ud83c\udf6b", color: "bg-orange-50 text-orange-700 border-orange-200" },
  other: { label: "Other", icon: "\ud83d\udce6", color: "bg-slate-50 text-slate-700 border-slate-200" },
};

// ── Quick-start templates ──
const TEMPLATES = {
  beach: {
    label: "Beach Vacation",
    icon: "\ud83c\udfd6\ufe0f",
    items: [
      { text: "Swimsuit(s)", category: "clothing" },
      { text: "Sunscreen SPF 50+", category: "toiletries" },
      { text: "Sunglasses", category: "accessories" },
      { text: "Flip flops / sandals", category: "clothing" },
      { text: "Beach towel", category: "gear" },
      { text: "Hat / sun hat", category: "accessories" },
      { text: "Cover-up / sarong", category: "clothing" },
      { text: "Aloe vera gel", category: "toiletries" },
      { text: "Waterproof phone pouch", category: "electronics" },
      { text: "Reef-safe sunscreen", category: "toiletries" },
      { text: "Snorkel gear", category: "gear" },
      { text: "Light evening outfit", category: "clothing" },
    ],
  },
  city: {
    label: "City Break",
    icon: "\ud83c\udfd9\ufe0f",
    items: [
      { text: "Comfortable walking shoes", category: "clothing" },
      { text: "Day bag / crossbody", category: "accessories" },
      { text: "Portable phone charger", category: "electronics" },
      { text: "Rain jacket / umbrella", category: "clothing" },
      { text: "Smart casual outfit (for restaurants)", category: "clothing" },
      { text: "Adaptor plug", category: "electronics" },
      { text: "Reusable water bottle", category: "gear" },
      { text: "City map / guidebook", category: "documents" },
      { text: "Comfortable jeans / trousers", category: "clothing" },
      { text: "Light layers", category: "clothing" },
    ],
  },
  hiking: {
    label: "Hiking / Outdoors",
    icon: "\ud83e\udd7e",
    items: [
      { text: "Hiking boots (broken in)", category: "clothing" },
      { text: "Moisture-wicking base layers", category: "clothing" },
      { text: "Rain shell jacket", category: "clothing" },
      { text: "Backpack (day pack)", category: "gear" },
      { text: "Water bottle / hydration bladder", category: "gear" },
      { text: "First aid kit", category: "health" },
      { text: "Sunscreen & lip balm SPF", category: "toiletries" },
      { text: "Headlamp / flashlight", category: "gear" },
      { text: "Trail snacks / energy bars", category: "snacks" },
      { text: "Insect repellent", category: "toiletries" },
      { text: "Trekking poles", category: "gear" },
      { text: "Quick-dry towel", category: "gear" },
    ],
  },
  essentials: {
    label: "Travel Essentials",
    icon: "\u2708\ufe0f",
    items: [
      { text: "Passport", category: "documents" },
      { text: "Travel insurance documents", category: "documents" },
      { text: "Phone charger + cable", category: "electronics" },
      { text: "Headphones", category: "electronics" },
      { text: "Toothbrush & toothpaste", category: "toiletries" },
      { text: "Deodorant", category: "toiletries" },
      { text: "Underwear (enough for trip + 1)", category: "clothing" },
      { text: "Socks", category: "clothing" },
      { text: "Medications (prescription)", category: "health" },
      { text: "Pain relief (ibuprofen/paracetamol)", category: "health" },
      { text: "Copies of booking confirmations", category: "documents" },
      { text: "Credit/debit cards", category: "documents" },
      { text: "Cash in local currency", category: "documents" },
      { text: "Travel pillow", category: "gear" },
    ],
  },
};

export default function PackingList({ tripId, tripDestination, tripStartDate, tripEndDate, activityOptions, accommodationOptions }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newItemText, setNewItemText] = useState("");
  const [newItemCategory, setNewItemCategory] = useState("other");
  const [showTemplates, setShowTemplates] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [collapsed, setCollapsed] = useState({});
  const inputRef = useRef(null);

  const loadItems = useCallback(async () => {
    const { data } = await supabase
      .from("packing_list")
      .select("*")
      .eq("trip_id", tripId)
      .order("category", { ascending: true })
      .order("sort_order", { ascending: true });
    setItems(data || []);
    setLoading(false);
  }, [tripId]);

  useEffect(() => { loadItems(); }, [loadItems]);

  async function addItem(e) {
    e.preventDefault();
    if (!newItemText.trim()) return;

    const { data: { user } } = await supabase.auth.getUser();
    const catItems = items.filter((i) => i.category === newItemCategory);
    const nextOrder = catItems.length > 0 ? Math.max(...catItems.map((i) => i.sort_order || 0)) + 1 : 0;

    await supabase.from("packing_list").insert({
      trip_id: tripId,
      user_id: user.id,
      text: newItemText.trim(),
      category: newItemCategory,
      is_packed: false,
      sort_order: nextOrder,
    });

    setNewItemText("");
    loadItems();
    setTimeout(() => inputRef.current?.focus(), 50);
  }

  async function toggleItem(id, currentState) {
    await supabase.from("packing_list").update({ is_packed: !currentState }).eq("id", id);
    setItems((prev) => prev.map((i) => i.id === id ? { ...i, is_packed: !currentState } : i));
  }

  async function deleteItem(id) {
    await supabase.from("packing_list").delete().eq("id", id);
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  async function applyTemplate(templateKey) {
    const template = TEMPLATES[templateKey];
    if (!template) return;

    const { data: { user } } = await supabase.auth.getUser();
    const existingTexts = new Set(items.map((i) => i.text.toLowerCase()));

    // Only add items that don't already exist
    const newItems = template.items.filter((t) => !existingTexts.has(t.text.toLowerCase()));
    if (newItems.length === 0) {
      setShowTemplates(false);
      return;
    }

    const rows = newItems.map((item, i) => ({
      trip_id: tripId,
      user_id: user.id,
      text: item.text,
      category: item.category,
      is_packed: false,
      sort_order: items.length + i,
    }));

    await supabase.from("packing_list").insert(rows);
    setShowTemplates(false);
    loadItems();
  }

  async function handleAiGenerate() {
    setAiGenerating(true);
    try {
      // Gather trip context
      const pickedActivities = (activityOptions || []).filter((a) => a.is_selected).map((a) => a.name).filter(Boolean);
      const pickedAccommodation = (accommodationOptions || []).filter((a) => a.is_selected).map((a) => a.name).filter(Boolean);

      const res = await fetch("/api/generate-packing-list", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          destination: tripDestination,
          startDate: tripStartDate,
          endDate: tripEndDate,
          activities: pickedActivities,
          accommodation: pickedAccommodation,
          existingItems: items.map((i) => i.text),
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to generate");
      }

      const result = await res.json();

      if (result.items && result.items.length > 0) {
        const { data: { user } } = await supabase.auth.getUser();
        const existingTexts = new Set(items.map((i) => i.text.toLowerCase()));
        const newItems = result.items.filter((t) => !existingTexts.has(t.text.toLowerCase()));

        if (newItems.length > 0) {
          const rows = newItems.map((item, i) => ({
            trip_id: tripId,
            user_id: user.id,
            text: item.text,
            category: item.category || "other",
            is_packed: false,
            sort_order: items.length + i,
          }));

          await supabase.from("packing_list").insert(rows);
          loadItems();
        }
      }
    } catch (err) {
      console.error("AI packing list error:", err);
      alert("Could not generate packing list: " + err.message);
    }
    setAiGenerating(false);
  }

  // Group items by category
  const grouped = {};
  items.forEach((item) => {
    const cat = item.category || "other";
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(item);
  });

  const packedCount = items.filter((i) => i.is_packed).length;
  const totalCount = items.length;
  const progressPct = totalCount > 0 ? Math.round((packedCount / totalCount) * 100) : 0;

  function toggleCategory(cat) {
    setCollapsed((prev) => ({ ...prev, [cat]: !prev[cat] }));
  }

  if (loading) return null;

  return (
    <div className="mb-6">
      <div className="bg-white rounded-xl border border-indigo-100 shadow-sm overflow-hidden">
        {/* Progress bar */}
        {totalCount > 0 && (
          <div className="h-1.5 bg-indigo-50">
            <div
              className="h-full bg-indigo-400 transition-all duration-300 rounded-r-full"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        )}

        {/* Generator buttons */}
        <div className="px-4 py-3 border-b border-slate-100 flex flex-wrap gap-2">
          <button
            onClick={() => setShowTemplates(!showTemplates)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6z" />
            </svg>
            Templates
          </button>
          <button
            onClick={handleAiGenerate}
            disabled={aiGenerating}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-indigo-100 text-indigo-700 hover:bg-indigo-200 transition-colors disabled:opacity-50"
          >
            {aiGenerating ? (
              <>
                <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                Generating...
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                </svg>
                AI Generate
              </>
            )}
          </button>
        </div>

        {/* Template picker */}
        {showTemplates && (
          <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50">
            <p className="text-xs text-slate-500 mb-2">Add items from a template (duplicates are skipped):</p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(TEMPLATES).map(([key, tmpl]) => (
                <button
                  key={key}
                  onClick={() => applyTemplate(key)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border border-slate-200 bg-white text-slate-700 hover:border-indigo-300 hover:bg-indigo-50 transition-colors"
                >
                  <span>{tmpl.icon}</span>
                  {tmpl.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Grouped items */}
        {Object.entries(grouped).map(([cat, catItems]) => {
          const catMeta = CATEGORIES[cat] || CATEGORIES.other;
          const catPacked = catItems.filter((i) => i.is_packed).length;
          const isCollapsed = collapsed[cat];

          return (
            <div key={cat} className="border-b border-slate-50 last:border-b-0">
              {/* Category header */}
              <button
                onClick={() => toggleCategory(cat)}
                className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-slate-50/50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm">{catMeta.icon}</span>
                  <span className="text-sm font-semibold text-slate-700">{catMeta.label}</span>
                  <span className="text-[10px] text-slate-400">{catPacked}/{catItems.length}</span>
                </div>
                <svg className={`w-4 h-4 text-slate-400 transition-transform ${isCollapsed ? "" : "rotate-180"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Category items */}
              {!isCollapsed && (
                <div className="pb-1">
                  {catItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 px-4 pl-10 py-1.5 group hover:bg-slate-50/50 transition-colors"
                    >
                      <button
                        onClick={() => toggleItem(item.id, item.is_packed)}
                        className={`flex-shrink-0 w-4.5 h-4.5 w-[18px] h-[18px] rounded border-2 flex items-center justify-center transition-colors ${
                          item.is_packed
                            ? "bg-indigo-500 border-indigo-500"
                            : "border-slate-300 hover:border-indigo-400"
                        }`}
                      >
                        {item.is_packed && (
                          <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </button>
                      <span className={`flex-1 text-sm transition-all ${
                        item.is_packed ? "line-through text-slate-400" : "text-slate-700"
                      }`}>
                        {item.text}
                      </span>
                      <button
                        onClick={() => deleteItem(item.id)}
                        className="flex-shrink-0 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {/* Add new item */}
        <form onSubmit={addItem} className="flex items-center gap-2 px-4 py-3 border-t border-slate-100">
          <select
            value={newItemCategory}
            onChange={(e) => setNewItemCategory(e.target.value)}
            className="text-xs border border-slate-200 rounded-md px-2 py-1.5 text-slate-600 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-400"
          >
            {Object.entries(CATEGORIES).map(([key, cat]) => (
              <option key={key} value={key}>{cat.icon} {cat.label}</option>
            ))}
          </select>
          <input
            ref={inputRef}
            type="text"
            value={newItemText}
            onChange={(e) => setNewItemText(e.target.value)}
            placeholder="Add item..."
            className="flex-1 text-sm bg-transparent outline-none placeholder:text-slate-300 text-slate-700"
          />
          {newItemText.trim() && (
            <button
              type="submit"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 px-2 py-1 rounded-md hover:bg-indigo-50 transition-colors"
            >
              Add
            </button>
          )}
        </form>

        {/* Empty state */}
        {totalCount === 0 && !showTemplates && (
          <div className="px-4 pb-4 -mt-1">
            <p className="text-xs text-slate-400 italic">Use a template or let AI generate a packing list based on your trip details.</p>
          </div>
        )}
      </div>
    </div>
  );
}
