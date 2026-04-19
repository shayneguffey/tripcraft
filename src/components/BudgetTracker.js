"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import InlineConfirm from "@/components/InlineConfirm";
import CATEGORY_COLORS from "@/lib/categoryColors";

// ── Category metadata for manual budget items ──
const EXPENSE_CATEGORIES = {
  shopping: { label: "Shopping", color: "bg-pink-100 text-pink-700" },
  tips: { label: "Tips", color: "bg-amber-100 text-amber-700" },
  insurance: { label: "Insurance", color: "bg-blue-100 text-blue-700" },
  visa: { label: "Visa/Fees", color: "bg-red-100 text-red-700" },
  sim_card: { label: "SIM/Data", color: "bg-cyan-100 text-cyan-700" },
  souvenirs: { label: "Souvenirs", color: "bg-purple-100 text-purple-700" },
  parking: { label: "Parking", color: "bg-slate-100 text-slate-700" },
  tolls: { label: "Tolls", color: "bg-slate-100 text-slate-700" },
  laundry: { label: "Laundry", color: "bg-teal-100 text-teal-700" },
  medical: { label: "Medical", color: "bg-red-100 text-red-700" },
  other: { label: "Other", color: "bg-slate-100 text-slate-700" },
};

// ── Budget section categories (aggregated from all modules) ──
// Colors are pulled from the centralized CATEGORY_COLORS so they stay
// in sync with the calendar, day cards, map pins, and option modules.
const _fc = CATEGORY_COLORS.flight;
const _ac = CATEGORY_COLORS.accommodation;
const _yc = CATEGORY_COLORS.activity;
const _dc = CATEGORY_COLORS.dining;
const _tc = CATEGORY_COLORS.transportation;
const _mc = CATEGORY_COLORS.misc;

const BUDGET_SECTIONS = [
  { key: "flights", label: "Flights", icon: "M12 19l9 2-9-18-9 18 9-2zm0 0v-8", color: _fc.textDark, bg: _fc.bg, bar: _fc.bar, chart: _fc.chart, perPerson: true },
  { key: "accommodation", label: "Stays", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0h4", color: _ac.textDark, bg: _ac.bg, bar: _ac.bar, chart: _ac.chart, perPerson: false },
  { key: "activities", label: "Activities", icon: "M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z", color: _yc.textDark, bg: _yc.bg, bar: _yc.bar, chart: _yc.chart, perPerson: true },
  { key: "dining", label: "Food & Dining", icon: "M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z", color: _dc.textDark, bg: _dc.bg, bar: _dc.bar, chart: _dc.chart, perPerson: true },
  { key: "transport", label: "Transportation", icon: "M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4", color: _tc.textDark, bg: _tc.bg, bar: _tc.bar, chart: _tc.chart, perPerson: false },
  { key: "misc", label: "Other Expenses", icon: "M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z", color: _mc.textDark, bg: _mc.bg, bar: _mc.bar, chart: _mc.chart, perPerson: false },
];

function formatPrice(amount, currency) {
  if (!amount && amount !== 0) return "$0.00";
  const sym = currency === "EUR" ? "\u20ac" : currency === "GBP" ? "\u00a3" : "$";
  return `${sym}${Number(amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function BudgetTracker({ tripId, numTravelers = 1, flightOptions, activityOptions, accommodationOptions, diningOptions, transportOptions, itinerarySelections }) {
  const [budgetItems, setBudgetItems] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(true);

  const travelers = Math.max(1, numTravelers || 1);

  // Helper: check if an option is selected in the current itinerary
  function isSelected(optionType, optionId) {
    if (itinerarySelections && itinerarySelections.length >= 0) {
      return itinerarySelections.some(s => s.option_type === optionType && s.option_id === optionId);
    }
    return false;
  }

  const loadBudgetItems = useCallback(async () => {
    const { data } = await supabase
      .from("budget_items")
      .select("*")
      .eq("trip_id", tripId)
      .order("sort_order", { ascending: true });
    setBudgetItems(data || []);
    setLoading(false);
  }, [tripId]);

  useEffect(() => { loadBudgetItems(); }, [loadBudgetItems]);

  // ── Calculate base totals from picked items (single-unit prices) ──
  // Flights: price already covers num_passengers from the booking. If that covers
  // fewer people than the trip's traveler count, scale up proportionally.
  const flightCalc = (() => {
    const selectedFlights = (flightOptions || []).filter((f) => isSelected("flight", f.id));
    if (selectedFlights.length === 0) return { base: 0, perPassenger: 0, passengers: 1 };
    let totalBase = 0;
    let totalPerPassenger = 0;
    for (const sel of selectedFlights) {
      if (!sel.total_price) continue;
      const price = Number(sel.total_price);
      const passengers = sel.num_passengers ? Math.max(1, Number(sel.num_passengers)) : 1;
      totalBase += price;
      totalPerPassenger += price / passengers;
    }
    return { base: totalBase, perPassenger: totalPerPassenger, passengers: selectedFlights[0]?.num_passengers || 1 };
  })();
  const flightTotal = flightCalc.perPassenger * travelers;

  const accommodationBase = (accommodationOptions || [])
    .filter((a) => isSelected("accommodation", a.id))
    .reduce((sum, a) => {
      if (a.total_price) return sum + Number(a.total_price);
      if (a.price_per_night && a.check_in_date && a.check_out_date) {
        const nights = Math.max(1, Math.round((new Date(a.check_out_date) - new Date(a.check_in_date)) / 86400000));
        return sum + Number(a.price_per_night) * nights;
      }
      if (a.price_per_night) return sum + Number(a.price_per_night);
      return sum;
    }, 0);

  const activityBase = (activityOptions || [])
    .filter((a) => isSelected("activity", a.id))
    .reduce((sum, a) => sum + (a.price ? Number(a.price) : 0), 0);

  const diningBase = (diningOptions || [])
    .filter((d) => isSelected("dining", d.id))
    .reduce((sum, d) => sum + (d.avg_meal_cost ? Number(d.avg_meal_cost) : 0), 0);

  // Transport: car rentals are flat rate, tickets (train/bus/ferry) are per-person
  const transportBase = (transportOptions || [])
    .filter((t) => isSelected("transportation", t.id))
    .reduce((sum, t) => {
      const p = t.price ? Number(t.price) : 0;
      const isCarRental = t.category === "car_rental";
      return sum + (isCarRental ? p : p * travelers);
    }, 0);

  const miscBase = budgetItems.reduce((sum, b) => sum + (b.amount ? Number(b.amount) : 0), 0);

  // Apply per-person multiplier where applicable
  const sectionTotals = {
    flights: flightTotal,                        // scaled by travelers / passengers from booking
    accommodation: accommodationBase,            // room price, not per-person
    activities: activityBase * travelers,        // per person
    dining: diningBase * travelers,              // per person
    transport: transportBase,                    // already computed: car rentals flat, tickets x travelers
    misc: miscBase,                              // manual items as-entered
  };

  const grandTotal = Object.values(sectionTotals).reduce((a, b) => a + b, 0);

  const sectionCounts = {
    flights: (flightOptions || []).filter((f) => isSelected("flight", f.id)).length,
    accommodation: (accommodationOptions || []).filter((a) => isSelected("accommodation", a.id)).length,
    activities: (activityOptions || []).filter((a) => isSelected("activity", a.id)).length,
    dining: (diningOptions || []).filter((d) => isSelected("dining", d.id)).length,
    transport: (transportOptions || []).filter((t) => isSelected("transportation", t.id)).length,
    misc: budgetItems.length,
  };

  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  async function handleDeleteBudgetItem(id) {
    setConfirmDeleteId(null);
    await supabase.from("budget_items").delete().eq("id", id);
    loadBudgetItems();
  }

  if (loading) return null;

  return (
    <div className="mb-6">
      {/* Section header */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          Trip Budget
          {travelers > 1 && (
            <span className="text-xs font-medium text-slate-400 ml-1">({travelers} travelers)</span>
          )}
        </h2>
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors bg-slate-100 text-slate-600 hover:bg-slate-200"
        >
          {expanded ? "Collapse" : "Expand"}
          <svg className={`w-3.5 h-3.5 transition-transform ${expanded ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      <div className="bg-white rounded-xl border border-green-100 shadow-sm overflow-hidden">

        {/* ═══ COMPACT VIEW (default) ═══ */}
        {!expanded && (
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-2xl font-bold text-slate-800">{formatPrice(grandTotal, "USD")}</div>
              <span className="text-sm text-slate-400">total estimated cost</span>
            </div>
            {/* Mini breakdown bar */}
            {grandTotal > 0 && (
              <div className="h-2 w-48 flex rounded-full overflow-hidden">
                {BUDGET_SECTIONS.map((sec) => {
                  const pct = (sectionTotals[sec.key] / grandTotal) * 100;
                  if (pct === 0) return null;
                  return <div key={sec.key} className={`${sec.bar}`} style={{ width: `${pct}%` }}
                    title={`${sec.label}: ${formatPrice(sectionTotals[sec.key], "USD")}`} />;
                })}
              </div>
            )}
          </div>
        )}

        {/* ═══ EXPANDED VIEW ═══ */}
        {expanded && (
          <>
            {/* Top bar with total */}
            <div className="p-4 pb-3 flex items-center justify-between border-b border-green-50">
              <div className="text-2xl font-bold text-slate-800">{formatPrice(grandTotal, "USD")}</div>
              <button onClick={() => setShowAddModal(true)}
                className="px-3 py-1.5 bg-green-600 text-white text-xs font-semibold rounded-lg hover:bg-green-700 transition-colors">
                + Add Expense
              </button>
            </div>

            <div className="p-4">
              {/* ── Donut chart + legend ── */}
              <div className="flex gap-6 mb-6">
                <DonutChart sections={BUDGET_SECTIONS} totals={sectionTotals} grandTotal={grandTotal} />
                <div className="flex-1 space-y-2">
                  {BUDGET_SECTIONS.map((sec) => {
                    const pct = grandTotal > 0 ? Math.round((sectionTotals[sec.key] / grandTotal) * 100) : 0;
                    const isPerPerson = sec.perPerson && travelers > 1;
                    return (
                      <div key={sec.key} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-sm ${sec.bar}`} />
                          <span className="text-sm text-slate-600">{sec.label}</span>
                          {isPerPerson && (
                            <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 rounded">x{travelers}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-slate-400">{pct}%</span>
                          <span className="text-sm font-semibold text-slate-800 w-24 text-right">{formatPrice(sectionTotals[sec.key], "USD")}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ── Line item details ── */}
              {sectionCounts.flights > 0 && (
                <BudgetSection title={`Flights${travelers > 1 ? ` (${travelers} travelers)` : ""}`} items={
                  (flightOptions || []).filter((f) => isSelected("flight", f.id)).map((f) => {
                    const price = f.total_price ? Number(f.total_price) : 0;
                    const pax = f.num_passengers ? Math.max(1, Number(f.num_passengers)) : 1;
                    const perPerson = price / pax;
                    const total = perPerson * travelers;
                    return {
                      name: f.airline_name ? `${f.airline_name} \u2014 ${f.departure_airport || ""}\u2192${f.arrival_airport || ""}` : (f.name || "Flight"),
                      amount: total,
                      unitNote: travelers > 1 || pax > 1 ? `${formatPrice(perPerson, "USD")}/pp \u00d7 ${travelers}` : null,
                    };
                  })
                } />
              )}

              {sectionCounts.accommodation > 0 && (
                <BudgetSection title="Stays" items={
                  (accommodationOptions || []).filter((a) => isSelected("accommodation", a.id)).map((a) => {
                    let amount = a.total_price;
                    let note = "";
                    if (!amount && a.price_per_night && a.check_in_date && a.check_out_date) {
                      const nights = Math.max(1, Math.round((new Date(a.check_out_date) - new Date(a.check_in_date)) / 86400000));
                      amount = Number(a.price_per_night) * nights;
                      note = ` (${nights} nights)`;
                    }
                    return { name: (a.name || "Stay") + note, amount };
                  })
                } />
              )}

              {sectionCounts.activities > 0 && (
                <BudgetSection title={`Activities${travelers > 1 ? ` (x${travelers})` : ""}`} items={
                  (activityOptions || []).filter((a) => isSelected("activity", a.id)).map((a) => ({
                    name: a.name || "Activity",
                    amount: (a.price || 0) * travelers,
                    unitNote: travelers > 1 ? `${formatPrice(a.price, "USD")}/pp` : null,
                  }))
                } />
              )}

              {sectionCounts.dining > 0 && (
                <BudgetSection title={`Food & Dining${travelers > 1 ? ` (x${travelers})` : ""}`} items={
                  (diningOptions || []).filter((d) => isSelected("dining", d.id)).map((d) => ({
                    name: d.name || "Restaurant",
                    amount: (d.avg_meal_cost || 0) * travelers,
                    unitNote: travelers > 1 ? `${formatPrice(d.avg_meal_cost, "USD")}/pp` : null,
                  }))
                } />
              )}

              {sectionCounts.transport > 0 && (
                <BudgetSection title="Transportation" items={
                  (transportOptions || []).filter((t) => isSelected("transportation", t.id)).map((t) => {
                    const p = t.price ? Number(t.price) : 0;
                    const isCarRental = t.category === "car_rental";
                    const total = isCarRental ? p : p * travelers;
                    return {
                      name: t.name || "Transport",
                      amount: total,
                      unitNote: !isCarRental && travelers > 1 ? `${formatPrice(p, "USD")}/pp` : (isCarRental ? "flat rate" : null),
                    };
                  })
                } />
              )}

              {/* Manual expenses */}
              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-semibold text-slate-700">Other Expenses</h4>
                  <button onClick={() => setShowAddModal(true)}
                    className="text-xs font-medium text-green-600 hover:text-green-700">+ Add</button>
                </div>
                {budgetItems.length > 0 ? (
                  <div className="space-y-1">
                    {budgetItems.map((item) => {
                      const cat = EXPENSE_CATEGORIES[item.category] || EXPENSE_CATEGORIES.other;
                      return (
                        <div key={item.id} className="flex items-center justify-between py-1.5 px-2 rounded hover:bg-slate-50 group">
                          <div className="flex items-center gap-2">
                            <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold ${cat.color}`}>
                              {cat.label}
                            </span>
                            <span className="text-sm text-slate-700">{item.name}</span>
                            {item.is_paid && <span className="text-[10px] text-green-600 font-medium">PAID</span>}
                          </div>
                          <div className="relative flex items-center gap-2">
                            <span className="text-sm font-semibold text-slate-800">{formatPrice(item.amount, item.currency)}</span>
                            <button onClick={() => setConfirmDeleteId(item.id)}
                              className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                            <InlineConfirm
                              open={confirmDeleteId === item.id}
                              message="Delete this expense?"
                              onConfirm={() => handleDeleteBudgetItem(item.id)}
                              onCancel={() => setConfirmDeleteId(null)}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">No manual expenses yet</p>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Add expense modal */}
      {showAddModal && (
        <AddBudgetItemModal tripId={tripId} onClose={() => setShowAddModal(false)} onSave={() => { setShowAddModal(false); loadBudgetItems(); }} />
      )}
    </div>
  );
}

// ── SVG Donut Chart ──
function DonutChart({ sections, totals, grandTotal }) {
  if (grandTotal === 0) {
    return (
      <div className="w-36 h-36 flex items-center justify-center">
        <div className="w-32 h-32 rounded-full border-8 border-slate-100 flex items-center justify-center">
          <span className="text-xs text-slate-400">No data</span>
        </div>
      </div>
    );
  }

  const size = 140;
  const strokeWidth = 24;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  let accumulated = 0;

  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        {sections.map((sec) => {
          const pct = totals[sec.key] / grandTotal;
          if (pct === 0) return null;
          const dashLength = pct * circumference;
          const dashOffset = -accumulated * circumference;
          accumulated += pct;
          return (
            <circle key={sec.key}
              cx={size / 2} cy={size / 2} r={radius}
              fill="none" stroke={sec.chart} strokeWidth={strokeWidth}
              strokeDasharray={`${dashLength} ${circumference - dashLength}`}
              strokeDashoffset={dashOffset}
              strokeLinecap="butt" />
          );
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-lg font-bold text-slate-800">{formatPrice(grandTotal, "USD")}</span>
        <span className="text-[10px] text-slate-400">total</span>
      </div>
    </div>
  );
}

// ── Budget section (line items) ──
function BudgetSection({ title, items }) {
  if (!items || items.length === 0) return null;
  return (
    <div className="mb-3">
      <h4 className="text-sm font-semibold text-slate-700 mb-1">{title}</h4>
      <div className="space-y-1">
        {items.map((item, i) => (
          <div key={i} className="flex items-center justify-between py-1 px-2">
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-600">{item.name}</span>
              {item.unitNote && (
                <span className="text-[10px] text-slate-400">{item.unitNote}</span>
              )}
            </div>
            <span className="text-sm font-semibold text-slate-800">{formatPrice(item.amount, "USD")}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Add manual expense modal ──
function AddBudgetItemModal({ tripId, onClose, onSave }) {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("other");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!name.trim() || !amount) { alert("Please enter a name and amount"); return; }
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase.from("budget_items").insert({
        trip_id: tripId,
        user_id: user.id,
        name: name.trim(),
        amount: parseFloat(amount),
        category,
        notes: notes.trim() || null,
      });
      if (error) throw error;
      onSave();
    } catch (err) {
      console.error("Error saving budget item:", err);
      alert("Error saving. Please try again.");
    }
    setSaving(false);
  }

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl border border-green-100 w-full max-w-md"
        onClick={(e) => e.stopPropagation()}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-bold text-slate-800">Add Expense</h3>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl">\u00d7</button>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-1">Expense Name *</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)}
              placeholder='e.g. "Travel Insurance", "SIM Card"'
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm" />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-1">Amount *</label>
            <div className="flex items-center gap-1">
              <span className="text-slate-400 text-sm">$</span>
              <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00" step="0.01"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm" />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm">
              {Object.entries(EXPENSE_CATEGORIES).map(([key, val]) => (
                <option key={key} value={key}>{val.label}</option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2}
              placeholder="Optional notes..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm" />
          </div>

          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 py-2.5 border border-slate-300 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50">
              Cancel
            </button>
            <button onClick={handleSave} disabled={saving || !name.trim() || !amount}
              className="flex-1 py-2.5 bg-green-600 text-white rounded-xl text-sm font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed">
              {saving ? "Saving..." : "Add Expense"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
