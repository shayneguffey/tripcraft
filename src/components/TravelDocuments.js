"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabase";

// ── Document type metadata ──
const DOC_TYPES = {
  booking: { label: "Booking", icon: "\ud83d\udcc5", color: "bg-blue-100 text-blue-700" },
  visa: { label: "Visa", icon: "\ud83d\udec2", color: "bg-green-100 text-green-700" },
  insurance: { label: "Insurance", icon: "\ud83d\udee1\ufe0f", color: "bg-red-100 text-red-700" },
  passport: { label: "Passport", icon: "\ud83d\udec2", color: "bg-indigo-100 text-indigo-700" },
  itinerary: { label: "Itinerary", icon: "\ud83d\uddfa\ufe0f", color: "bg-cyan-100 text-cyan-700" },
  receipt: { label: "Receipt", icon: "\ud83e\uddfe", color: "bg-amber-100 text-amber-700" },
  voucher: { label: "Voucher", icon: "\ud83c\udf9f\ufe0f", color: "bg-purple-100 text-purple-700" },
  map: { label: "Map", icon: "\ud83d\uddfa\ufe0f", color: "bg-teal-100 text-teal-700" },
  ticket: { label: "Ticket", icon: "\ud83c\udfab", color: "bg-pink-100 text-pink-700" },
  general: { label: "Document", icon: "\ud83d\udcc4", color: "bg-slate-100 text-slate-700" },
};

const CATEGORIES = {
  flights: "Flights",
  accommodation: "Accommodation",
  transport: "Transport",
  activities: "Activities",
  personal: "Personal",
  financial: "Financial",
  other: "Other",
};

export default function TravelDocuments({ tripId }) {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [viewingDoc, setViewingDoc] = useState(null);
  const [filter, setFilter] = useState("all");

  const loadDocs = useCallback(async () => {
    const { data } = await supabase
      .from("travel_documents")
      .select("*")
      .eq("trip_id", tripId)
      .order("created_at", { ascending: false });
    setDocs(data || []);
    setLoading(false);
  }, [tripId]);

  useEffect(() => { loadDocs(); }, [loadDocs]);

  async function handleDelete(id, fileUrl) {
    if (!confirm("Delete this document?")) return;
    // Delete file from storage if it's a Supabase URL
    if (fileUrl && fileUrl.includes("supabase")) {
      try {
        const path = fileUrl.split("/travel-docs/")[1];
        if (path) await supabase.storage.from("travel-docs").remove([path]);
      } catch (_) {}
    }
    await supabase.from("travel_documents").delete().eq("id", id);
    setDocs((prev) => prev.filter((d) => d.id !== id));
  }

  const filtered = filter === "all" ? docs : docs.filter((d) => d.category === filter);

  // Count by category
  const categoryCounts = {};
  docs.forEach((d) => {
    const cat = d.category || "other";
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
  });

  if (loading) return null;

  return (
    <div className="mb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <svg className="w-5 h-5 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
          </svg>
          Travel Documents
        </h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-rose-600 text-white hover:bg-rose-700 transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Add Document
        </button>
      </div>

      <div className="bg-white rounded-xl border border-rose-100 shadow-sm overflow-hidden">
        {/* Filter bar */}
        {docs.length > 0 && (
          <div className="px-4 py-2.5 border-b border-slate-100 flex gap-1.5 overflow-x-auto">
            <button
              onClick={() => setFilter("all")}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                filter === "all" ? "bg-rose-100 text-rose-700" : "text-slate-500 hover:bg-slate-100"
              }`}
            >
              All ({docs.length})
            </button>
            {Object.entries(CATEGORIES).map(([key, label]) => {
              const count = categoryCounts[key];
              if (!count) return null;
              return (
                <button
                  key={key}
                  onClick={() => setFilter(key)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                    filter === key ? "bg-rose-100 text-rose-700" : "text-slate-500 hover:bg-slate-100"
                  }`}
                >
                  {label} ({count})
                </button>
              );
            })}
          </div>
        )}

        {/* Document cards */}
        {filtered.length > 0 ? (
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filtered.map((doc) => (
              <DocCard
                key={doc.id}
                doc={doc}
                onView={() => setViewingDoc(doc)}
                onDelete={() => handleDelete(doc.id, doc.file_url || doc.thumbnail_url)}
              />
            ))}
          </div>
        ) : (
          <div className="p-8 text-center">
            <svg className="w-12 h-12 text-slate-200 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
            <p className="text-sm text-slate-400">No documents yet</p>
            <p className="text-xs text-slate-300 mt-1">Add booking confirmations, visas, insurance docs, tickets, and more</p>
          </div>
        )}
      </div>

      {/* Add modal */}
      {showAddModal && (
        <AddDocumentModal
          tripId={tripId}
          onClose={() => setShowAddModal(false)}
          onSave={() => { setShowAddModal(false); loadDocs(); }}
        />
      )}

      {/* Viewing modal */}
      {viewingDoc && (
        <ViewDocumentModal
          doc={viewingDoc}
          onClose={() => setViewingDoc(null)}
        />
      )}
    </div>
  );
}

// ── Document card ──
function DocCard({ doc, onView, onDelete }) {
  const typeMeta = DOC_TYPES[doc.doc_type] || DOC_TYPES.general;
  const hasImage = doc.thumbnail_url || (doc.file_type && doc.file_type.startsWith("image/"));
  const previewUrl = doc.thumbnail_url || doc.file_url;

  return (
    <div
      className="border border-slate-100 rounded-lg overflow-hidden hover:border-rose-200 hover:shadow-sm transition-all cursor-pointer group"
      onClick={onView}
    >
      {/* Preview / thumbnail */}
      {hasImage && previewUrl ? (
        <div className="h-32 bg-slate-50 relative overflow-hidden">
          <img
            src={previewUrl}
            alt={doc.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-2 left-2">
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${typeMeta.color}`}>
              {typeMeta.icon} {typeMeta.label}
            </span>
          </div>
        </div>
      ) : (
        <div className="h-20 bg-slate-50 flex items-center justify-center relative">
          <span className="text-3xl">{typeMeta.icon}</span>
          <div className="absolute top-2 left-2">
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${typeMeta.color}`}>
              {typeMeta.label}
            </span>
          </div>
        </div>
      )}

      {/* Info */}
      <div className="p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h4 className="text-sm font-semibold text-slate-800 truncate">{doc.name}</h4>
            {doc.provider && (
              <p className="text-xs text-slate-500 truncate">{doc.provider}</p>
            )}
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="flex-shrink-0 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
        {doc.reference_number && (
          <p className="text-[10px] text-slate-400 mt-1 font-mono">Ref: {doc.reference_number}</p>
        )}
        {doc.dates && (
          <p className="text-[10px] text-slate-400">{doc.dates}</p>
        )}
        {doc.ai_summary && (
          <p className="text-xs text-slate-500 mt-1 line-clamp-2">{doc.ai_summary}</p>
        )}
      </div>
    </div>
  );
}

// ── View document modal ──
function ViewDocumentModal({ doc, onClose }) {
  const typeMeta = DOC_TYPES[doc.doc_type] || DOC_TYPES.general;
  const previewUrl = doc.thumbnail_url || doc.file_url;
  const isImage = doc.file_type && doc.file_type.startsWith("image/");

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl border border-rose-100 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}>
        {/* Image preview */}
        {previewUrl && (isImage || doc.thumbnail_url) && (
          <div className="bg-slate-50 flex items-center justify-center max-h-[50vh] overflow-hidden">
            <img src={previewUrl} alt={doc.name} className="max-w-full max-h-[50vh] object-contain" />
          </div>
        )}

        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${typeMeta.color}`}>
                  {typeMeta.icon} {typeMeta.label}
                </span>
                <span className="text-xs text-slate-400">{CATEGORIES[doc.category] || "Other"}</span>
              </div>
              <h3 className="text-lg font-bold text-slate-800">{doc.name}</h3>
              {doc.provider && <p className="text-sm text-slate-500">{doc.provider}</p>}
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl">{"\u00d7"}</button>
          </div>

          {/* Details */}
          <div className="space-y-3 mb-4">
            {doc.reference_number && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 w-24">Reference</span>
                <span className="text-sm font-mono text-slate-700 bg-slate-50 px-2 py-0.5 rounded">{doc.reference_number}</span>
              </div>
            )}
            {doc.dates && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 w-24">Dates</span>
                <span className="text-sm text-slate-700">{doc.dates}</span>
              </div>
            )}
            {doc.ai_summary && (
              <div>
                <span className="text-xs text-slate-400">Summary</span>
                <p className="text-sm text-slate-700 mt-0.5">{doc.ai_summary}</p>
              </div>
            )}
            {doc.notes && (
              <div>
                <span className="text-xs text-slate-400">Notes</span>
                <p className="text-sm text-slate-600 mt-0.5">{doc.notes}</p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            {doc.file_url && (
              <a
                href={doc.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-4 py-2 bg-rose-600 text-white text-sm font-semibold rounded-lg hover:bg-rose-700 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                Open
              </a>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 text-slate-600 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Add document modal ──
function AddDocumentModal({ tripId, onClose, onSave }) {
  const [mode, setMode] = useState(null); // "screenshot" | "upload" | "link"
  const [name, setName] = useState("");
  const [notes, setNotes] = useState("");
  const [screenshot, setScreenshot] = useState(null);
  const [uploadFile, setUploadFile] = useState(null);
  const [shareLink, setShareLink] = useState("");
  const [aiResult, setAiResult] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef(null);

  // ── Screenshot handling ──
  function handleImageFile(file) {
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = async (e) => {
      const dataUrl = e.target.result;
      setScreenshot(dataUrl);
      setProcessing(true);

      try {
        const res = await fetch("/api/parse-document", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: dataUrl, mimeType: file.type }),
        });

        if (res.ok) {
          const result = await res.json();
          setAiResult(result);
          if (result.name && !name) setName(result.name);
        }
      } catch (err) {
        console.error("AI parse error:", err);
      }
      setProcessing(false);
    };
    reader.readAsDataURL(file);
  }

  function handleScreenshotPaste(e) {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (const item of items) {
      if (item.type.startsWith("image/")) {
        handleImageFile(item.getAsFile());
        e.preventDefault();
        return;
      }
    }
  }

  function handleDrop(e) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      if (mode === "screenshot" || file.type.startsWith("image/")) {
        handleImageFile(file);
      } else {
        setUploadFile(file);
        if (!name) setName(file.name.replace(/\.[^.]+$/, ""));
      }
    }
  }

  // ── File upload handling ──
  function handleFileSelect(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadFile(file);
    if (!name) setName(file.name.replace(/\.[^.]+$/, ""));

    // If it's an image, also run AI on it
    if (file.type.startsWith("image/")) {
      handleImageFile(file);
    }
  }

  // ── Save document ──
  async function handleSave() {
    if (!name.trim()) { alert("Please enter a document name"); return; }
    setSaving(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      let fileUrl = null;
      let thumbnailUrl = null;
      let fileType = null;
      let fileSize = null;
      let source = "upload";

      // Upload file to Supabase Storage
      if (uploadFile) {
        const ext = uploadFile.name.split(".").pop();
        const path = `${tripId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const { error: uploadError } = await supabase.storage.from("travel-docs").upload(path, uploadFile);
        if (!uploadError) {
          const { data: urlData } = supabase.storage.from("travel-docs").getPublicUrl(path);
          fileUrl = urlData.publicUrl;
          fileType = uploadFile.type;
          fileSize = uploadFile.size;
        }
      }

      // Upload screenshot as thumbnail
      if (screenshot) {
        source = "screenshot";
        const base64 = screenshot.split(",")[1];
        const byteArray = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
        const blob = new Blob([byteArray], { type: "image/png" });
        const path = `${tripId}/thumb-${Date.now()}.png`;
        const { error: thumbError } = await supabase.storage.from("travel-docs").upload(path, blob);
        if (!thumbError) {
          const { data: urlData } = supabase.storage.from("travel-docs").getPublicUrl(path);
          thumbnailUrl = urlData.publicUrl;
          if (!fileUrl) {
            fileUrl = thumbnailUrl;
            fileType = "image/png";
            fileSize = byteArray.length;
          }
        }
      }

      // Share link mode
      if (mode === "link" && shareLink) {
        fileUrl = shareLink;
        source = "share_link";
      }

      // Insert record
      const { error } = await supabase.from("travel_documents").insert({
        trip_id: tripId,
        user_id: user.id,
        name: name.trim(),
        doc_type: aiResult?.doc_type || "general",
        category: aiResult?.category || "other",
        file_url: fileUrl,
        thumbnail_url: thumbnailUrl,
        file_type: fileType,
        file_size: fileSize,
        source,
        reference_number: aiResult?.reference_number || null,
        dates: aiResult?.dates || null,
        provider: aiResult?.provider || null,
        ai_summary: aiResult?.ai_summary || null,
        notes: notes.trim() || null,
      });

      if (error) throw error;
      onSave();
    } catch (err) {
      console.error("Error saving document:", err);
      alert("Error saving document: " + err.message);
    }
    setSaving(false);
  }

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl border border-rose-100 w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
        onPaste={handleScreenshotPaste}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-bold text-slate-800">Add Document</h3>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl">{"\u00d7"}</button>
          </div>

          {/* Mode selection */}
          {!mode && (
            <div className="grid grid-cols-3 gap-3 mb-5">
              <button
                onClick={() => setMode("screenshot")}
                className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-slate-200 hover:border-rose-300 hover:bg-rose-50 transition-colors"
              >
                <svg className="w-8 h-8 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
                </svg>
                <span className="text-xs font-semibold text-slate-700">Screenshot</span>
                <span className="text-[10px] text-slate-400">Paste or drop</span>
              </button>
              <button
                onClick={() => setMode("upload")}
                className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-slate-200 hover:border-rose-300 hover:bg-rose-50 transition-colors"
              >
                <svg className="w-8 h-8 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                </svg>
                <span className="text-xs font-semibold text-slate-700">Upload File</span>
                <span className="text-[10px] text-slate-400">PDF, image, doc</span>
              </button>
              <button
                onClick={() => setMode("link")}
                className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-slate-200 hover:border-rose-300 hover:bg-rose-50 transition-colors"
              >
                <svg className="w-8 h-8 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
                </svg>
                <span className="text-xs font-semibold text-slate-700">Share Link</span>
                <span className="text-[10px] text-slate-400">Google Drive, etc.</span>
              </button>
            </div>
          )}

          {/* Screenshot mode */}
          {mode === "screenshot" && !screenshot && (
            <div className="mb-4">
              <div
                className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center cursor-pointer hover:border-rose-300 hover:bg-rose-50/30 transition-colors"
                onClick={() => { /* clicking focuses the modal for paste */ }}
              >
                <svg className="w-10 h-10 text-slate-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9.75a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
                </svg>
                <p className="text-sm text-slate-500 font-medium">Paste screenshot (Ctrl+V)</p>
                <p className="text-xs text-slate-400 mt-1">or drag and drop an image</p>
              </div>
              <button onClick={() => setMode(null)} className="text-xs text-slate-400 hover:text-slate-600 mt-2">{"\u2190"} Back</button>
            </div>
          )}

          {/* Screenshot preview */}
          {screenshot && (
            <div className="mb-4">
              <div className="relative rounded-lg overflow-hidden border border-slate-200 mb-2">
                <img src={screenshot} alt="Screenshot" className="w-full max-h-48 object-contain bg-slate-50" />
                {processing && (
                  <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                    <div className="flex items-center gap-2 text-sm text-rose-600">
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                      Analyzing document...
                    </div>
                  </div>
                )}
              </div>
              {aiResult && (
                <div className="bg-rose-50 rounded-lg p-3 text-xs space-y-1">
                  <div className="font-semibold text-rose-700">AI detected: {DOC_TYPES[aiResult.doc_type]?.icon} {DOC_TYPES[aiResult.doc_type]?.label || aiResult.doc_type}</div>
                  {aiResult.provider && <div className="text-slate-600">Provider: {aiResult.provider}</div>}
                  {aiResult.reference_number && <div className="text-slate-600">Ref: <span className="font-mono">{aiResult.reference_number}</span></div>}
                  {aiResult.dates && <div className="text-slate-600">Dates: {aiResult.dates}</div>}
                  {aiResult.ai_summary && <div className="text-slate-500 italic">{aiResult.ai_summary}</div>}
                </div>
              )}
              <button onClick={() => { setScreenshot(null); setAiResult(null); }} className="text-xs text-slate-400 hover:text-slate-600 mt-2">Clear screenshot</button>
            </div>
          )}

          {/* Upload mode */}
          {mode === "upload" && !uploadFile && !screenshot && (
            <div className="mb-4">
              <div
                className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center cursor-pointer hover:border-rose-300 hover:bg-rose-50/30 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <svg className="w-10 h-10 text-slate-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                </svg>
                <p className="text-sm text-slate-500 font-medium">Click to select a file</p>
                <p className="text-xs text-slate-400 mt-1">PDF, images, or documents</p>
              </div>
              <input ref={fileInputRef} type="file" className="hidden" accept="image/*,.pdf,.doc,.docx" onChange={handleFileSelect} />
              <button onClick={() => setMode(null)} className="text-xs text-slate-400 hover:text-slate-600 mt-2">{"\u2190"} Back</button>
            </div>
          )}

          {/* Upload preview */}
          {uploadFile && !screenshot && (
            <div className="mb-4 bg-slate-50 rounded-lg p-3 flex items-center gap-3">
              <svg className="w-8 h-8 text-slate-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-slate-700 truncate">{uploadFile.name}</p>
                <p className="text-xs text-slate-400">{(uploadFile.size / 1024).toFixed(1)} KB</p>
              </div>
              <button onClick={() => setUploadFile(null)} className="text-slate-400 hover:text-red-500">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}

          {/* Share link mode */}
          {mode === "link" && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-1">Share Link</label>
              <input
                type="url"
                value={shareLink}
                onChange={(e) => setShareLink(e.target.value)}
                placeholder="https://drive.google.com/file/d/... or https://www.dropbox.com/..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 text-sm"
              />
              <p className="text-[10px] text-slate-400 mt-1">Google Drive, Dropbox, OneDrive, or any public file link</p>
              <button onClick={() => setMode(null)} className="text-xs text-slate-400 hover:text-slate-600 mt-2">{"\u2190"} Back</button>
            </div>
          )}

          {/* Common fields (shown once a mode is selected) */}
          {mode && (
            <>
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-1">Document Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Hilton Booking Confirmation"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 text-sm"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  placeholder="Optional notes..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 text-sm"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 py-2.5 border border-slate-300 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving || !name.trim() || processing}
                  className="flex-1 py-2.5 bg-rose-600 text-white rounded-xl text-sm font-semibold hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? "Saving..." : "Save Document"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
