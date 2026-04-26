(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/src/app/trips/[id]/page.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>TripDetailPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/supabase.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$FlightOptions$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/FlightOptions.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ActivityOptions$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ActivityOptions.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$AccommodationOptions$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/AccommodationOptions.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$DiningOptions$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/DiningOptions.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$TransportationOptions$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/TransportationOptions.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$TimeSelectPopup$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/TimeSelectPopup.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$BudgetTracker$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/BudgetTracker.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$PlanningChecklist$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/PlanningChecklist.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$PackingList$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/PackingList.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$TravelDocuments$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/TravelDocuments.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$MapPatternBg$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/MapPatternBg.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$TripMap$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/TripMap.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$TripCollaborators$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/TripCollaborators.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$InlineConfirm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/InlineConfirm.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$categoryColors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/categoryColors.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$DateRangePicker$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/DateRangePicker.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$FlightPathLoader$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/FlightPathLoader.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature(), _s2 = __turbopack_context__.k.signature(), _s3 = __turbopack_context__.k.signature(), _s4 = __turbopack_context__.k.signature(), _s5 = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
// Helper: generate array of dates for calendar display
function getCalendarRange(startDate, endDate) {
    const start = new Date(startDate + "T00:00:00");
    const end = new Date(endDate + "T00:00:00");
    // Show at least 1 week before and after
    const calStart = new Date(start);
    calStart.setDate(calStart.getDate() - 7);
    // Go back to the previous Sunday
    while(calStart.getDay() !== 0){
        calStart.setDate(calStart.getDate() - 1);
    }
    const calEnd = new Date(end);
    calEnd.setDate(calEnd.getDate() + 7);
    // Go forward to the next Saturday
    while(calEnd.getDay() !== 6){
        calEnd.setDate(calEnd.getDate() + 1);
    }
    const dates = [];
    const current = new Date(calStart);
    while(current <= calEnd){
        dates.push(new Date(current));
        current.setDate(current.getDate() + 1);
    }
    return dates;
}
function formatDateKey(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
}
function isSameDay(a, b) {
    return formatDateKey(a) === formatDateKey(b);
}
function isInRange(date, start, end) {
    const d = formatDateKey(date);
    return d >= start && d <= end;
}
function TripDetailPage() {
    _s();
    const [trip, setTrip] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [days, setDays] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({});
    const [activities, setActivities] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({});
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const [selectedDay, setSelectedDay] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [dragType, setDragType] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null); // "start" or "end"
    const [dragDate, setDragDate] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [editingField, setEditingField] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null); // "title", "destination", "dates", "description"
    const [editValue, setEditValue] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [editValue2, setEditValue2] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(""); // for end date when editing dates
    const [flightOptions, setFlightOptions] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [activityOptions, setActivityOptions] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [accommodationOptions, setAccommodationOptions] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [diningOptions, setDiningOptions] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [transportOptions, setTransportOptions] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [currentUser, setCurrentUser] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [activeItineraryTab, setActiveItineraryTab] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("flights");
    const [activeLowerTab, setActiveLowerTab] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("map");
    const [eventPopup, setEventPopup] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null); // { type, data, dateKey, rect }
    const [hoveredDay, setHoveredDay] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [editingDayHeader, setEditingDayHeader] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [dayHeaderValue, setDayHeaderValue] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    // Itinerary state
    const [itineraries, setItineraries] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [activeItineraryId, setActiveItineraryId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [editingItineraryTitle, setEditingItineraryTitle] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [itineraryTitleValue, setItineraryTitleValue] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [editingItineraryDesc, setEditingItineraryDesc] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [itineraryDescValue, setItineraryDescValue] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [editingCalendarTitle, setEditingCalendarTitle] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [calendarTitleValue, setCalendarTitleValue] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [itinerarySelections, setItinerarySelections] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [editingItineraryTravelers, setEditingItineraryTravelers] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [itineraryTravelersValue, setItineraryTravelersValue] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [confirmDeleteItinerary, setConfirmDeleteItinerary] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [editingItineraryDates, setEditingItineraryDates] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [shareUrl, setShareUrl] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [shareLoading, setShareLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [shareCopied, setShareCopied] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [shareDropdownPos, setShareDropdownPos] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const shareBtnRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])();
    const params = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useParams"])();
    const loadTrip = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "TripDetailPage.useCallback[loadTrip]": async ()=>{
            const { data: { user } } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].auth.getUser();
            if (!user) {
                router.push("/login");
                return;
            }
            setCurrentUser(user);
            const { data: tripData, error: tripError } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from("trips").select("*").eq("id", params.id).single();
            if (tripError || !tripData) {
                router.push("/trips");
                return;
            }
            setTrip(tripData);
            // Generate banner image if missing (fire and forget — page loads immediately)
            if (tripData.destination && !tripData.banner_image) {
                fetch("/api/generate-banner", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        destination: tripData.destination,
                        tripId: tripData.id
                    })
                }).then({
                    "TripDetailPage.useCallback[loadTrip]": (res)=>res.json()
                }["TripDetailPage.useCallback[loadTrip]"]).then({
                    "TripDetailPage.useCallback[loadTrip]": (data)=>{
                        if (data.imageUrl) {
                            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from("trips").update({
                                banner_image: data.imageUrl
                            }).eq("id", tripData.id);
                            setTrip({
                                "TripDetailPage.useCallback[loadTrip]": (prev)=>({
                                        ...prev,
                                        banner_image: data.imageUrl
                                    })
                            }["TripDetailPage.useCallback[loadTrip]"]);
                        }
                    }
                }["TripDetailPage.useCallback[loadTrip]"]).catch({
                    "TripDetailPage.useCallback[loadTrip]": (err)=>console.error("Banner generation error:", err)
                }["TripDetailPage.useCallback[loadTrip]"]);
            }
            // Fetch itineraries for this trip
            const { data: itinerariesData, error: itinError } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from("itineraries").select("*").eq("trip_id", params.id).order("sort_order", {
                ascending: true
            });
            let itins = itinerariesData || [];
            // Auto-create a default itinerary if table exists but is empty
            if (!itinError && itins.length === 0) {
                const { data: newItin } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from("itineraries").insert({
                    trip_id: params.id,
                    user_id: user.id,
                    title: "Itinerary 1",
                    start_date: tripData.start_date || null,
                    end_date: tripData.end_date || null,
                    num_travelers: tripData.num_travelers || 1,
                    sort_order: 0
                }).select().single();
                if (newItin) {
                    itins = [
                        newItin
                    ];
                    // Migrate existing is_selected options to this itinerary
                    const tables = [
                        {
                            table: "flight_options",
                            type: "flight"
                        },
                        {
                            table: "accommodation_options",
                            type: "accommodation"
                        },
                        {
                            table: "activity_options",
                            type: "activity"
                        },
                        {
                            table: "dining_options",
                            type: "dining"
                        },
                        {
                            table: "transportation_options",
                            type: "transportation"
                        }
                    ];
                    for (const { table, type } of tables){
                        const { data: selected } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from(table).select("id").eq("trip_id", params.id).eq("is_selected", true);
                        if (selected && selected.length > 0) {
                            await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from("itinerary_selections").insert(selected.map({
                                "TripDetailPage.useCallback[loadTrip]": (s)=>({
                                        itinerary_id: newItin.id,
                                        option_type: type,
                                        option_id: s.id
                                    })
                            }["TripDetailPage.useCallback[loadTrip]"]));
                        }
                    }
                }
            }
            setItineraries(itins);
            if (itins.length > 0) {
                const firstId = itins[0].id;
                setActiveItineraryId({
                    "TripDetailPage.useCallback[loadTrip]": (prev)=>{
                        const targetId = prev && itins.find({
                            "TripDetailPage.useCallback[loadTrip]": (i)=>i.id === prev
                        }["TripDetailPage.useCallback[loadTrip]"]) ? prev : firstId;
                        // Load selections for the target itinerary
                        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from("itinerary_selections").select("*").eq("itinerary_id", targetId).then({
                            "TripDetailPage.useCallback[loadTrip]": ({ data: selectionsData })=>{
                                setItinerarySelections(selectionsData || []);
                            }
                        }["TripDetailPage.useCallback[loadTrip]"]);
                        return targetId;
                    }
                }["TripDetailPage.useCallback[loadTrip]"]);
            } else {
                // Table doesn't exist yet — fall back to no-itinerary mode
                setActiveItineraryId(null);
                setItinerarySelections([]);
            }
            // Fetch days keyed by date — filtered by active itinerary if available
            const activeItinId = itins.length > 0 ? itins.find({
                "TripDetailPage.useCallback[loadTrip]": (i)=>i.id === activeItineraryId
            }["TripDetailPage.useCallback[loadTrip]"])?.id || itins[0].id : null;
            let daysQuery = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from("days").select("*").eq("trip_id", params.id);
            if (activeItinId) {
                daysQuery = daysQuery.eq("itinerary_id", activeItinId);
            }
            const { data: daysData } = await daysQuery;
            const daysMap = {};
            (daysData || []).forEach({
                "TripDetailPage.useCallback[loadTrip]": (d)=>{
                    daysMap[d.date] = d;
                }
            }["TripDetailPage.useCallback[loadTrip]"]);
            setDays(daysMap);
            // Fetch activities grouped by day_id
            if (daysData && daysData.length > 0) {
                const dayIds = daysData.map({
                    "TripDetailPage.useCallback[loadTrip].dayIds": (d)=>d.id
                }["TripDetailPage.useCallback[loadTrip].dayIds"]);
                const { data: activitiesData } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from("activities").select("*").in("day_id", dayIds).order("sort_order", {
                    ascending: true
                });
                const grouped = {};
                (activitiesData || []).forEach({
                    "TripDetailPage.useCallback[loadTrip]": (a)=>{
                        if (!grouped[a.day_id]) grouped[a.day_id] = [];
                        grouped[a.day_id].push(a);
                    }
                }["TripDetailPage.useCallback[loadTrip]"]);
                setActivities(grouped);
            }
            // Fetch option tables so parent state stays fresh (needed for DayPopout time edits)
            const [{ data: flightData }, { data: activityData }, { data: accommodationData }, { data: diningData }, { data: transportData }] = await Promise.all([
                __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from("flight_options").select("*").eq("trip_id", params.id).order("sort_order", {
                    ascending: true
                }),
                __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from("activity_options").select("*").eq("trip_id", params.id).order("sort_order", {
                    ascending: true
                }),
                __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from("accommodation_options").select("*").eq("trip_id", params.id).order("sort_order", {
                    ascending: true
                }),
                __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from("dining_options").select("*").eq("trip_id", params.id).order("sort_order", {
                    ascending: true
                }),
                __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from("transportation_options").select("*").eq("trip_id", params.id).order("sort_order", {
                    ascending: true
                })
            ]);
            setFlightOptions(flightData || []);
            setActivityOptions(activityData || []);
            setAccommodationOptions(accommodationData || []);
            setDiningOptions(diningData || []);
            setTransportOptions(transportData || []);
            setLoading(false);
        }
    }["TripDetailPage.useCallback[loadTrip]"], [
        params.id,
        router
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "TripDetailPage.useEffect": ()=>{
            loadTrip();
        }
    }["TripDetailPage.useEffect"], [
        loadTrip
    ]);
    // Update trip date range in database
    async function updateTripDates(newStart, newEnd) {
        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from("trips").update({
            start_date: newStart,
            end_date: newEnd,
            updated_at: new Date().toISOString()
        }).eq("id", params.id);
        setTrip((prev)=>({
                ...prev,
                start_date: newStart,
                end_date: newEnd
            }));
    }
    function startEditing(field) {
        if (field === "title") setEditValue(trip.title || "");
        else if (field === "destination") setEditValue(trip.destination || "");
        else if (field === "dates") {
            setEditValue(trip.start_date || "");
            setEditValue2(trip.end_date || "");
        } else if (field === "description") setEditValue(trip.description || "");
        else if (field === "num_travelers") setEditValue(trip.num_travelers || 1);
        setEditingField(field);
    }
    async function saveField(field) {
        const updates = {
            updated_at: new Date().toISOString()
        };
        if (field === "title") updates.title = editValue;
        else if (field === "destination") updates.destination = editValue || null;
        else if (field === "dates") {
            updates.start_date = editValue || null;
            updates.end_date = editValue2 || null;
        } else if (field === "description") updates.description = editValue || null;
        else if (field === "num_travelers") updates.num_travelers = Math.max(1, parseInt(editValue) || 1);
        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from("trips").update(updates).eq("id", params.id);
        setEditingField(null);
        loadTrip();
    }
    function handleFieldKeyDown(e, field) {
        if (e.key === "Enter" && field !== "description") {
            e.preventDefault();
            saveField(field);
        } else if (e.key === "Escape") {
            setEditingField(null);
        }
    }
    // ─── Itinerary management functions ───
    async function createItinerary() {
        const { data: { user } } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].auth.getUser();
        if (!user) return;
        const activeItin = itineraries.find((i)=>i.id === activeItineraryId);
        const newSort = itineraries.length;
        const { data: newItin, error: insertError } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from("itineraries").insert({
            trip_id: params.id,
            user_id: user.id,
            title: `Itinerary ${newSort + 1}`,
            start_date: activeItin?.start_date || trip?.start_date || null,
            end_date: activeItin?.end_date || trip?.end_date || null,
            num_travelers: activeItin?.num_travelers || trip?.num_travelers || 1,
            sort_order: newSort
        }).select().single();
        if (insertError) {
            console.error("Failed to create itinerary:", insertError);
            alert("Failed to create itinerary: " + insertError.message);
            return;
        }
        if (newItin) {
            setItineraries((prev)=>[
                    ...prev,
                    newItin
                ]);
            setActiveItineraryId(newItin.id);
            setItinerarySelections([]);
            setDays({}); // Clear day headers — new itinerary starts fresh
        }
    }
    async function switchItinerary(id) {
        // Fetch both selections and days in parallel, then batch state updates
        const [selectionsRes, daysRes] = await Promise.all([
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from("itinerary_selections").select("*").eq("itinerary_id", id),
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from("days").select("*").eq("trip_id", params.id).eq("itinerary_id", id)
        ]);
        const daysMap = {};
        (daysRes.data || []).forEach((d)=>{
            daysMap[d.date] = d;
        });
        // Batch all state updates together to trigger a single re-render
        setActiveItineraryId(id);
        setItinerarySelections(selectionsRes.data || []);
        setDays(daysMap);
    }
    async function saveItineraryTitle(id) {
        if (!itineraryTitleValue.trim()) {
            setEditingItineraryTitle(null);
            return;
        }
        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from("itineraries").update({
            title: itineraryTitleValue.trim()
        }).eq("id", id);
        setItineraries((prev)=>prev.map((i)=>i.id === id ? {
                    ...i,
                    title: itineraryTitleValue.trim()
                } : i));
        setEditingItineraryTitle(null);
    }
    async function saveCalendarItineraryTitle() {
        if (!activeItineraryId) return;
        const val = calendarTitleValue.trim();
        if (!val) {
            setEditingCalendarTitle(false);
            return;
        }
        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from("itineraries").update({
            title: val
        }).eq("id", activeItineraryId);
        setItineraries((prev)=>prev.map((i)=>i.id === activeItineraryId ? {
                    ...i,
                    title: val
                } : i));
        setEditingCalendarTitle(false);
    }
    async function saveItineraryDescription() {
        if (!activeItineraryId) return;
        const val = itineraryDescValue.trim();
        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from("itineraries").update({
            description: val || null
        }).eq("id", activeItineraryId);
        setItineraries((prev)=>prev.map((i)=>i.id === activeItineraryId ? {
                    ...i,
                    description: val || null
                } : i));
        setEditingItineraryDesc(false);
    }
    async function saveItineraryTravelers() {
        if (!activeItineraryId) return;
        const val = Math.max(1, parseInt(itineraryTravelersValue) || 1);
        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from("itineraries").update({
            num_travelers: val
        }).eq("id", activeItineraryId);
        setItineraries((prev)=>prev.map((i)=>i.id === activeItineraryId ? {
                    ...i,
                    num_travelers: val
                } : i));
        setEditingItineraryTravelers(false);
    }
    async function deleteItineraryConfirmed(id) {
        if (itineraries.length <= 1) return;
        setConfirmDeleteItinerary(null);
        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from("itineraries").delete().eq("id", id);
        const remaining = itineraries.filter((i)=>i.id !== id);
        setItineraries(remaining);
        if (activeItineraryId === id && remaining.length > 0) {
            switchItinerary(remaining[0].id);
        }
    }
    async function shareItinerary() {
        if (!activeItineraryId) return;
        // If dropdown is already open, close it
        if (shareUrl) {
            setShareUrl(null);
            setShareCopied(false);
            setShareDropdownPos(null);
            return;
        }
        setShareLoading(true);
        // Calculate dropdown position from button
        const btnRect = shareBtnRef.current?.getBoundingClientRect();
        if (btnRect) {
            setShareDropdownPos({
                top: btnRect.bottom + 4,
                right: window.innerWidth - btnRect.right
            });
        }
        try {
            // Check if this itinerary already has a share token
            const activeItin = itineraries.find((i)=>i.id === activeItineraryId);
            if (activeItin?.share_token) {
                setShareUrl(`${window.location.origin}/guide/${activeItin.share_token}`);
                setShareLoading(false);
                return;
            }
            // Generate a new share token
            const token = crypto.randomUUID().replace(/-/g, "").slice(0, 16);
            const { data: updatedRow, error } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from("itineraries").update({
                share_token: token
            }).eq("id", activeItineraryId).select("id, share_token").single();
            console.log("[share] update result:", {
                updatedRow,
                error: error?.message
            });
            if (error || !updatedRow) {
                console.error("[share] Failed to save share token:", error?.message || "no row returned");
                alert("Could not generate share link. Check the browser console for details.");
                setShareLoading(false);
                setShareDropdownPos(null);
                return;
            }
            const url = `${window.location.origin}/guide/${token}`;
            setShareUrl(url);
            setItineraries((prev)=>prev.map((i)=>i.id === activeItineraryId ? {
                        ...i,
                        share_token: token
                    } : i));
        } catch (err) {
            console.error("[share] Unexpected error:", err);
            setShareDropdownPos(null);
        }
        setShareLoading(false);
    }
    async function toggleSelection(optionType, optionId) {
        if (!activeItineraryId) return;
        const existing = itinerarySelections.find((s)=>s.option_type === optionType && s.option_id === optionId);
        if (existing) {
            // Remove selection
            await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from("itinerary_selections").delete().eq("id", existing.id);
            setItinerarySelections((prev)=>prev.filter((s)=>s.id !== existing.id));
        } else {
            // Add selection
            const { data: newSel } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from("itinerary_selections").insert({
                itinerary_id: activeItineraryId,
                option_type: optionType,
                option_id: optionId
            }).select().single();
            if (newSel) {
                setItinerarySelections((prev)=>[
                        ...prev,
                        newSel
                    ]);
            }
        }
    }
    function isOptionSelected(optionType, optionId) {
        return itinerarySelections.some((s)=>s.option_type === optionType && s.option_id === optionId);
    }
    // Get the active itinerary object
    const activeItinerary = itineraries.find((i)=>i.id === activeItineraryId);
    async function saveDayHeader(dateKey) {
        const existing = days[dateKey];
        if (existing) {
            // Update existing day — also ensure itinerary_id is set
            const updates = {
                title: dayHeaderValue || null
            };
            if (activeItineraryId && !existing.itinerary_id) {
                updates.itinerary_id = activeItineraryId;
            }
            await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from("days").update(updates).eq("id", existing.id);
        } else if (dayHeaderValue.trim()) {
            await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from("days").insert({
                trip_id: params.id,
                date: dateKey,
                title: dayHeaderValue || null,
                itinerary_id: activeItineraryId || null
            });
        }
        setEditingDayHeader(null);
        setDayHeaderValue("");
        loadTrip();
    }
    // Get flights on a given date — filtered by itinerary selections (supports multiple flight options)
    function getFlightsOnDate(dateKey) {
        const selectedFlightIds = itinerarySelections.filter((s)=>s.option_type === "flight").map((s)=>s.option_id);
        const selectedOpts = flightOptions.filter((o)=>selectedFlightIds.includes(o.id));
        if (selectedOpts.length === 0) return [];
        return selectedOpts.flatMap((opt)=>(opt.flight_legs || []).filter((leg)=>leg.departure_date === dateKey).map((leg)=>({
                    ...leg,
                    _optionId: opt.id,
                    notes: leg.notes || opt.notes,
                    source_url: opt.source_url,
                    screenshot_url: opt.screenshot_url
                })));
    }
    function getScheduledActivities(dateKey) {
        const selectedIds = itinerarySelections.filter((s)=>s.option_type === "activity").map((s)=>s.option_id);
        return activityOptions.filter((a)=>a.scheduled_date === dateKey && selectedIds.includes(a.id));
    }
    function getScheduledAccommodations(dateKey) {
        const selectedIds = itinerarySelections.filter((s)=>s.option_type === "accommodation").map((s)=>s.option_id);
        return accommodationOptions.filter((a)=>{
            if (!selectedIds.includes(a.id) || !a.check_in_date) return false;
            const checkOut = a.check_out_date || a.check_in_date;
            return dateKey >= a.check_in_date && dateKey < checkOut;
        });
    }
    function getScheduledDining(dateKey) {
        const selectedIds = itinerarySelections.filter((s)=>s.option_type === "dining").map((s)=>s.option_id);
        return diningOptions.filter((d)=>d.scheduled_date === dateKey && selectedIds.includes(d.id));
    }
    function getScheduledTransport(dateKey) {
        const selectedIds = itinerarySelections.filter((s)=>s.option_type === "transportation").map((s)=>s.option_id);
        return transportOptions.filter((t)=>{
            if (!selectedIds.includes(t.id)) return false;
            if (t.departure_date === dateKey) return true;
            if (t.arrival_date && t.arrival_date !== t.departure_date && t.arrival_date === dateKey) return true;
            return false;
        });
    }
    // Save date range from the inline date picker
    async function handleDatePickerSave(newStart, newEnd) {
        setEditingItineraryDates(false);
        if (activeItineraryId) {
            updateItineraryDates(newStart, newEnd);
        } else {
            updateTripDates(newStart, newEnd);
        }
    }
    // Update itinerary date range in database
    async function updateItineraryDates(newStart, newEnd) {
        if (!activeItineraryId) return;
        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from("itineraries").update({
            start_date: newStart,
            end_date: newEnd
        }).eq("id", activeItineraryId);
        setItineraries((prev)=>prev.map((i)=>i.id === activeItineraryId ? {
                    ...i,
                    start_date: newStart,
                    end_date: newEnd
                } : i));
    }
    // Determine which dates to use for calendar: itinerary dates if available, else trip dates
    const calendarStartDate = activeItinerary?.start_date || trip?.start_date;
    const calendarEndDate = activeItinerary?.end_date || trip?.end_date;
    // Drag handlers for adjusting date range (updates itinerary dates, not trip dates)
    function handleMouseDown(dateKey, e) {
        e.preventDefault();
        if (!calendarStartDate || !calendarEndDate) return;
        if (dateKey === calendarStartDate) {
            setDragType("start");
        } else if (dateKey === calendarEndDate) {
            setDragType("end");
        }
    }
    function handleMouseEnter(dateKey) {
        if (!dragType) return;
        setDragDate(dateKey);
    }
    function handleMouseUp() {
        if (dragType && dragDate) {
            let newStart = calendarStartDate;
            let newEnd = calendarEndDate;
            if (dragType === "start" && dragDate < calendarEndDate) {
                newStart = dragDate;
            } else if (dragType === "end" && dragDate > calendarStartDate) {
                newEnd = dragDate;
            }
            if (newStart !== calendarStartDate || newEnd !== calendarEndDate) {
                if (activeItineraryId) {
                    updateItineraryDates(newStart, newEnd);
                } else {
                    updateTripDates(newStart, newEnd);
                }
            }
        }
        setDragType(null);
        setDragDate(null);
    }
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "TripDetailPage.useEffect": ()=>{
            if (dragType) {
                window.addEventListener("mouseup", handleMouseUp);
                return ({
                    "TripDetailPage.useEffect": ()=>window.removeEventListener("mouseup", handleMouseUp)
                })["TripDetailPage.useEffect"];
            }
        }
    }["TripDetailPage.useEffect"], [
        dragType,
        dragDate
    ]);
    // Get the effective start/end while dragging — uses itinerary dates if available
    function getEffectiveRange() {
        let start = calendarStartDate;
        let end = calendarEndDate;
        if (dragType === "start" && dragDate && dragDate < end) {
            start = dragDate;
        } else if (dragType === "end" && dragDate && dragDate > start) {
            end = dragDate;
        }
        return {
            start,
            end
        };
    }
    if (loading) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$FlightPathLoader$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
            text: "Loading trip..."
        }, void 0, false, {
            fileName: "[project]/src/app/trips/[id]/page.js",
            lineNumber: 678,
            columnNumber: 12
        }, this);
    }
    const { start: effectiveStart, end: effectiveEnd } = calendarStartDate ? getEffectiveRange() : {
        start: null,
        end: null
    };
    // Use effective range (accounts for dragging) so calendar updates live
    const calendarDates = effectiveStart && effectiveEnd ? getCalendarRange(effectiveStart, effectiveEnd) : [];
    // Group dates into weeks
    const weeks = [];
    for(let i = 0; i < calendarDates.length; i += 7){
        weeks.push(calendarDates.slice(i, i + 7));
    }
    // Build the calendar title showing the range of months displayed
    function getCalendarTitle() {
        if (calendarDates.length === 0) return "";
        const first = calendarDates[0];
        const last = calendarDates[calendarDates.length - 1];
        const firstMonth = first.toLocaleDateString("en-US", {
            month: "long",
            year: "numeric"
        });
        const lastMonth = last.toLocaleDateString("en-US", {
            month: "long",
            year: "numeric"
        });
        if (firstMonth === lastMonth) return firstMonth;
        // Same year — show "June — August 2026"
        if (first.getFullYear() === last.getFullYear()) {
            return `${first.toLocaleDateString("en-US", {
                month: "long"
            })} — ${last.toLocaleDateString("en-US", {
                month: "long"
            })} ${last.getFullYear()}`;
        }
        // Different years — show "December 2026 — January 2027"
        return `${firstMonth} — ${lastMonth}`;
    }
    const today = formatDateKey(new Date());
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "min-h-screen relative",
        onMouseUp: handleMouseUp,
        children: [
            shareUrl && shareDropdownPos && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "fixed inset-0 z-[100]",
                        onClick: ()=>{
                            setShareUrl(null);
                            setShareCopied(false);
                            setShareDropdownPos(null);
                        }
                    }, void 0, false, {
                        fileName: "[project]/src/app/trips/[id]/page.js",
                        lineNumber: 726,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "fixed z-[101] bg-white rounded-xl shadow-xl border border-stone-200 px-4 py-3",
                        style: {
                            top: shareDropdownPos.top,
                            right: shareDropdownPos.right,
                            width: 320
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-xs font-medium text-stone-600 mb-2",
                                children: "Pocket Guide link"
                            }, void 0, false, {
                                fileName: "[project]/src/app/trips/[id]/page.js",
                                lineNumber: 731,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center gap-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        type: "text",
                                        readOnly: true,
                                        value: shareUrl,
                                        className: "flex-1 text-xs text-stone-700 bg-stone-50 rounded-lg px-3 py-2 border border-stone-200 truncate",
                                        onClick: (e)=>e.target.select()
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/trips/[id]/page.js",
                                        lineNumber: 733,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: async ()=>{
                                            await navigator.clipboard.writeText(shareUrl);
                                            setShareCopied(true);
                                            setTimeout(()=>setShareCopied(false), 2000);
                                        },
                                        className: "text-xs px-3 py-2 rounded-lg font-semibold transition-colors flex-shrink-0",
                                        style: {
                                            background: shareCopied ? "#4a965a" : "#da7b4a",
                                            color: "white"
                                        },
                                        children: shareCopied ? "Copied!" : "Copy"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/trips/[id]/page.js",
                                        lineNumber: 740,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/trips/[id]/page.js",
                                lineNumber: 732,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center justify-between mt-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-[10px] text-stone-400",
                                        children: "Mobile-friendly travel view. Anyone with the link can open it — no login."
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/trips/[id]/page.js",
                                        lineNumber: 753,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                        href: shareUrl,
                                        target: "_blank",
                                        rel: "noopener noreferrer",
                                        className: "text-[10px] font-semibold flex-shrink-0 ml-2 hover:underline",
                                        style: {
                                            color: "#da7b4a"
                                        },
                                        children: "Open →"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/trips/[id]/page.js",
                                        lineNumber: 754,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/trips/[id]/page.js",
                                lineNumber: 752,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/trips/[id]/page.js",
                        lineNumber: 727,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "fixed inset-0",
                style: {
                    background: "linear-gradient(to bottom, rgba(210,195,172,0.7) 0%, rgba(222,210,190,0.6) 50%, rgba(210,195,172,0.7) 100%)"
                }
            }, void 0, false, {
                fileName: "[project]/src/app/trips/[id]/page.js",
                lineNumber: 769,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$MapPatternBg$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                tileSize: 280,
                opacity: 1
            }, void 0, false, {
                fileName: "[project]/src/app/trips/[id]/page.js",
                lineNumber: 770,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
                className: "relative z-10 max-w-6xl mx-auto px-6 py-4",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "relative",
                        style: {
                            marginBottom: "-20px",
                            paddingBottom: "20px"
                        },
                        children: [
                            trip?.banner_image && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "absolute inset-0 z-0 overflow-hidden rounded-t-2xl",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                        src: trip.banner_image,
                                        alt: "",
                                        className: "w-full h-full object-cover",
                                        style: {
                                            transform: "scale(1.08)",
                                            transformOrigin: "center"
                                        }
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/trips/[id]/page.js",
                                        lineNumber: 778,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "absolute inset-x-0 bottom-0 h-[15%]",
                                        style: {
                                            background: "linear-gradient(to top, rgba(210,195,172,0.7) 0%, transparent 100%)"
                                        }
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/trips/[id]/page.js",
                                        lineNumber: 785,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "absolute inset-0",
                                        style: {
                                            background: "rgba(0,0,0,0.1)"
                                        }
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/trips/[id]/page.js",
                                        lineNumber: 792,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/trips/[id]/page.js",
                                lineNumber: 777,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: `relative z-10 ${trip?.banner_image ? "pb-4" : ""}`,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-start justify-between mb-4",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex items-center pt-2 pl-2",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                                    src: "/TRIPCRAFTLOGO.png",
                                                    alt: "TripCraft",
                                                    style: {
                                                        height: 200,
                                                        width: "auto",
                                                        ...trip?.banner_image ? {
                                                            filter: "brightness(0) invert(1)"
                                                        } : {}
                                                    }
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/trips/[id]/page.js",
                                                    lineNumber: 801,
                                                    columnNumber: 17
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/trips/[id]/page.js",
                                                lineNumber: 800,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                                href: "/trips",
                                                className: `flex items-center gap-2 px-4 py-1.5 mr-4 mt-4 rounded-lg text-sm font-semibold transition-all hover:ring-2 hover:ring-[#da7b4a]/40 ${trip?.banner_image ? "text-white/90" : "text-stone-600"}`,
                                                style: {
                                                    background: trip?.banner_image ? "rgba(30, 22, 12, 0.5)" : "rgba(255,255,255,0.45)",
                                                    border: trip?.banner_image ? "1px solid rgba(212, 165, 116, 0.3)" : "1px solid rgba(180, 165, 140, 0.4)",
                                                    backdropFilter: trip?.banner_image ? "blur(8px)" : "none"
                                                },
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                                        xmlns: "http://www.w3.org/2000/svg",
                                                        viewBox: "0 0 16 16",
                                                        fill: "currentColor",
                                                        className: "w-3.5 h-3.5",
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                            fillRule: "evenodd",
                                                            d: "M9.78 4.22a.75.75 0 0 1 0 1.06L7.06 8l2.72 2.72a.75.75 0 1 1-1.06 1.06L5.47 8.53a.75.75 0 0 1 0-1.06l3.25-3.25a.75.75 0 0 1 1.06 0Z",
                                                            clipRule: "evenodd"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/trips/[id]/page.js",
                                                            lineNumber: 823,
                                                            columnNumber: 19
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/trips/[id]/page.js",
                                                        lineNumber: 822,
                                                        columnNumber: 17
                                                    }, this),
                                                    "Back to Trips"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/trips/[id]/page.js",
                                                lineNumber: 811,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/trips/[id]/page.js",
                                        lineNumber: 799,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "px-2 mt-4",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: editingField === "title" ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                    type: "text",
                                                    value: editValue,
                                                    onChange: (e)=>setEditValue(e.target.value),
                                                    onBlur: ()=>saveField("title"),
                                                    onKeyDown: (e)=>handleFieldKeyDown(e, "title"),
                                                    autoFocus: true,
                                                    className: "text-3xl font-bold text-stone-800 bg-white border border-stone-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-[#da7b4a]/50 focus:border-transparent w-full max-w-xl"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/trips/[id]/page.js",
                                                    lineNumber: 834,
                                                    columnNumber: 19
                                                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                                    onClick: ()=>startEditing("title"),
                                                    className: `text-6xl font-normal cursor-text transition-colors px-2 pb-0.5 ${trip?.banner_image ? "text-white drop-shadow-md hover:text-white/90" : "text-stone-800 hover:text-[#da7b4a]"}`,
                                                    style: {
                                                        fontFamily: "var(--font-bebas), sans-serif",
                                                        letterSpacing: "2px"
                                                    },
                                                    title: "Click to edit trip name",
                                                    children: trip.title || "Untitled Trip"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/trips/[id]/page.js",
                                                    lineNumber: 844,
                                                    columnNumber: 19
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/trips/[id]/page.js",
                                                lineNumber: 832,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: editingField === "destination" ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex items-center gap-1.5",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                                            className: "w-4 h-4 text-stone-400 flex-shrink-0",
                                                            fill: "none",
                                                            stroke: "currentColor",
                                                            viewBox: "0 0 24 24",
                                                            strokeWidth: 2,
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                                    strokeLinecap: "round",
                                                                    strokeLinejoin: "round",
                                                                    d: "M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/app/trips/[id]/page.js",
                                                                    lineNumber: 863,
                                                                    columnNumber: 145
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                                    strokeLinecap: "round",
                                                                    strokeLinejoin: "round",
                                                                    d: "M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/app/trips/[id]/page.js",
                                                                    lineNumber: 863,
                                                                    columnNumber: 237
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/app/trips/[id]/page.js",
                                                            lineNumber: 863,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                            type: "text",
                                                            value: editValue,
                                                            onChange: (e)=>setEditValue(e.target.value),
                                                            onBlur: ()=>saveField("destination"),
                                                            onKeyDown: (e)=>handleFieldKeyDown(e, "destination"),
                                                            autoFocus: true,
                                                            placeholder: "Enter destination",
                                                            className: "text-stone-500 bg-white border border-stone-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-[#da7b4a]/50 focus:border-transparent"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/trips/[id]/page.js",
                                                            lineNumber: 864,
                                                            columnNumber: 21
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/trips/[id]/page.js",
                                                    lineNumber: 862,
                                                    columnNumber: 19
                                                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    onClick: ()=>startEditing("destination"),
                                                    className: `flex items-center gap-1.5 font-semibold italic cursor-text transition-colors px-2 pt-0 ${trip?.banner_image ? "text-white drop-shadow-md hover:text-white/90" : "text-stone-500 hover:text-[#da7b4a]"}`,
                                                    title: "Click to edit destination",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                                            className: "w-4 h-4 flex-shrink-0",
                                                            fill: "none",
                                                            stroke: "currentColor",
                                                            viewBox: "0 0 24 24",
                                                            strokeWidth: 2,
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                                    strokeLinecap: "round",
                                                                    strokeLinejoin: "round",
                                                                    d: "M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/app/trips/[id]/page.js",
                                                                    lineNumber: 885,
                                                                    columnNumber: 130
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                                    strokeLinecap: "round",
                                                                    strokeLinejoin: "round",
                                                                    d: "M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/app/trips/[id]/page.js",
                                                                    lineNumber: 885,
                                                                    columnNumber: 222
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/app/trips/[id]/page.js",
                                                            lineNumber: 885,
                                                            columnNumber: 21
                                                        }, this),
                                                        trip.destination || /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "italic text-stone-400",
                                                            children: "No destination set"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/trips/[id]/page.js",
                                                            lineNumber: 886,
                                                            columnNumber: 42
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/trips/[id]/page.js",
                                                    lineNumber: 876,
                                                    columnNumber: 19
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/trips/[id]/page.js",
                                                lineNumber: 860,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/trips/[id]/page.js",
                                        lineNumber: 830,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/trips/[id]/page.js",
                                lineNumber: 797,
                                columnNumber: 11
                            }, this),
                            itineraries.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-end gap-0.5 -mb-px relative z-10 px-2",
                                children: [
                                    itineraries.map((itin)=>{
                                        const isActive = itin.id === activeItineraryId;
                                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: `relative flex items-center gap-1.5 px-5 py-2.5 rounded-t-xl text-sm font-semibold cursor-pointer transition-all ${isActive ? "text-white" : trip?.banner_image ? "text-white/80 hover:text-white" : "text-stone-600 hover:text-stone-800"}`,
                                            style: {
                                                background: isActive ? "#da7b4a" : trip?.banner_image ? "rgba(30, 22, 12, 0.4)" : "rgba(195,178,155,0.35)",
                                                backdropFilter: !isActive && trip?.banner_image ? "blur(4px)" : "none",
                                                borderTop: isActive ? "2px solid #b5552a" : "2px solid transparent",
                                                borderLeft: isActive ? "1px solid #b5552a" : trip?.banner_image ? "1px solid rgba(255,255,255,0.15)" : "1px solid rgba(180,165,140,0.3)",
                                                borderRight: isActive ? "1px solid #b5552a" : trip?.banner_image ? "1px solid rgba(255,255,255,0.15)" : "1px solid rgba(180,165,140,0.3)",
                                                borderBottom: isActive ? "2px solid transparent" : "2px solid rgba(180,165,140,0.3)",
                                                marginBottom: -2,
                                                minWidth: "140px",
                                                maxWidth: "220px"
                                            },
                                            onClick: ()=>switchItinerary(itin.id),
                                            children: [
                                                editingItineraryTitle === itin.id ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                    type: "text",
                                                    value: itineraryTitleValue,
                                                    onChange: (e)=>setItineraryTitleValue(e.target.value),
                                                    onBlur: ()=>saveItineraryTitle(itin.id),
                                                    onKeyDown: (e)=>{
                                                        if (e.key === "Enter") saveItineraryTitle(itin.id);
                                                        if (e.key === "Escape") setEditingItineraryTitle(null);
                                                    },
                                                    onClick: (e)=>e.stopPropagation(),
                                                    autoFocus: true,
                                                    className: "bg-white/90 text-stone-800 border border-stone-300 rounded px-1.5 py-0.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#da7b4a]/50 w-32"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/trips/[id]/page.js",
                                                    lineNumber: 918,
                                                    columnNumber: 21
                                                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    onClick: (e)=>{
                                                        if (isActive) {
                                                            e.stopPropagation();
                                                            setEditingItineraryTitle(itin.id);
                                                            setItineraryTitleValue(itin.title);
                                                        }
                                                    },
                                                    className: `uppercase line-clamp-2 ${isActive ? "cursor-text" : ""}`,
                                                    title: isActive ? "Click to rename" : "",
                                                    children: itin.title
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/trips/[id]/page.js",
                                                    lineNumber: 932,
                                                    columnNumber: 21
                                                }, this),
                                                itineraries.length > 1 && isActive && editingItineraryTitle !== itin.id && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    onClick: (e)=>{
                                                        e.stopPropagation();
                                                        setConfirmDeleteItinerary(itin.id);
                                                    },
                                                    className: "ml-1 w-4 h-4 flex items-center justify-center rounded-full text-white/60 hover:text-white hover:bg-white/20 transition-colors",
                                                    title: "Delete itinerary",
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                                        className: "w-3 h-3",
                                                        fill: "none",
                                                        stroke: "currentColor",
                                                        viewBox: "0 0 24 24",
                                                        strokeWidth: 2,
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                            strokeLinecap: "round",
                                                            strokeLinejoin: "round",
                                                            d: "M6 18L18 6M6 6l12 12"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/trips/[id]/page.js",
                                                            lineNumber: 954,
                                                            columnNumber: 25
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/trips/[id]/page.js",
                                                        lineNumber: 953,
                                                        columnNumber: 23
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/trips/[id]/page.js",
                                                    lineNumber: 948,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$InlineConfirm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                                    open: confirmDeleteItinerary === itin.id,
                                                    message: "Delete this itinerary?",
                                                    onConfirm: ()=>deleteItineraryConfirmed(itin.id),
                                                    onCancel: ()=>setConfirmDeleteItinerary(null)
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/trips/[id]/page.js",
                                                    lineNumber: 958,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, itin.id, true, {
                                            fileName: "[project]/src/app/trips/[id]/page.js",
                                            lineNumber: 899,
                                            columnNumber: 17
                                        }, this);
                                    }),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: createItinerary,
                                        className: "flex items-center gap-1 px-3 py-2 mb-px rounded-t-lg text-xs font-semibold text-white/80 hover:text-white transition-all",
                                        style: {
                                            background: "#c4886a",
                                            border: "1px solid #b5774d",
                                            borderBottom: "none"
                                        },
                                        title: "Create new itinerary version",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                                xmlns: "http://www.w3.org/2000/svg",
                                                viewBox: "0 0 16 16",
                                                fill: "currentColor",
                                                className: "w-3 h-3",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                    d: "M8.75 3.75a.75.75 0 0 0-1.5 0v3.5h-3.5a.75.75 0 0 0 0 1.5h3.5v3.5a.75.75 0 0 0 1.5 0v-3.5h3.5a.75.75 0 0 0 0-1.5h-3.5v-3.5Z"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/trips/[id]/page.js",
                                                    lineNumber: 977,
                                                    columnNumber: 115
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/trips/[id]/page.js",
                                                lineNumber: 977,
                                                columnNumber: 15
                                            }, this),
                                            "New"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/trips/[id]/page.js",
                                        lineNumber: 967,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "ml-auto",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            ref: shareBtnRef,
                                            onClick: shareItinerary,
                                            disabled: shareLoading,
                                            className: "flex items-center gap-1 px-3 py-2 mb-px rounded-t-lg text-xs font-semibold transition-all",
                                            style: {
                                                background: shareUrl ? "rgba(30,22,12,0.75)" : "rgba(30,22,12,0.55)",
                                                backdropFilter: "blur(6px)",
                                                border: "1px solid rgba(212,165,116,0.3)",
                                                borderBottom: "none",
                                                color: "rgba(255,255,255,0.85)"
                                            },
                                            title: "Share this itinerary",
                                            children: [
                                                shareLoading ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "w-3 h-3 border border-white/40 border-t-white rounded-full animate-spin"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/trips/[id]/page.js",
                                                    lineNumber: 997,
                                                    columnNumber: 19
                                                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                                    className: "w-3 h-3",
                                                    fill: "none",
                                                    stroke: "currentColor",
                                                    viewBox: "0 0 24 24",
                                                    strokeWidth: 2,
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                        strokeLinecap: "round",
                                                        strokeLinejoin: "round",
                                                        d: "M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/trips/[id]/page.js",
                                                        lineNumber: 999,
                                                        columnNumber: 114
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/trips/[id]/page.js",
                                                    lineNumber: 999,
                                                    columnNumber: 19
                                                }, this),
                                                "Share"
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/trips/[id]/page.js",
                                            lineNumber: 982,
                                            columnNumber: 15
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/trips/[id]/page.js",
                                        lineNumber: 981,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/trips/[id]/page.js",
                                lineNumber: 895,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/trips/[id]/page.js",
                        lineNumber: 774,
                        columnNumber: 9
                    }, this),
                    calendarDates.length > 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "relative z-10 bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden select-none uppercase",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "px-6 py-2 border-b border-stone-200/60 bg-white normal-case",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-start gap-6",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex-shrink-0",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "relative mt-0.5 min-h-[16px]",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            onClick: ()=>setEditingItineraryDates(true),
                                                            className: "text-xs text-stone-400 cursor-pointer hover:text-[#da7b4a] transition-colors inline-flex items-center gap-1",
                                                            title: "Click to edit dates",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                                                    className: "w-3 h-3",
                                                                    fill: "none",
                                                                    stroke: "currentColor",
                                                                    viewBox: "0 0 24 24",
                                                                    strokeWidth: 2,
                                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                                        strokeLinecap: "round",
                                                                        strokeLinejoin: "round",
                                                                        d: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/app/trips/[id]/page.js",
                                                                        lineNumber: 1023,
                                                                        columnNumber: 118
                                                                    }, this)
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/app/trips/[id]/page.js",
                                                                    lineNumber: 1023,
                                                                    columnNumber: 23
                                                                }, this),
                                                                effectiveStart && effectiveEnd ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                                                    children: [
                                                                        new Date(effectiveStart + "T00:00:00").toLocaleDateString("en-US", {
                                                                            month: "long",
                                                                            day: "numeric",
                                                                            year: "numeric"
                                                                        }),
                                                                        " — ",
                                                                        new Date(effectiveEnd + "T00:00:00").toLocaleDateString("en-US", {
                                                                            month: "long",
                                                                            day: "numeric",
                                                                            year: "numeric"
                                                                        })
                                                                    ]
                                                                }, void 0, true) : "Set dates"
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/app/trips/[id]/page.js",
                                                            lineNumber: 1018,
                                                            columnNumber: 21
                                                        }, this),
                                                        editingItineraryDates && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$DateRangePicker$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                                            startDate: effectiveStart || null,
                                                            endDate: effectiveEnd || null,
                                                            onSave: handleDatePickerSave,
                                                            onCancel: ()=>setEditingItineraryDates(false)
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/trips/[id]/page.js",
                                                            lineNumber: 1033,
                                                            columnNumber: 23
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/trips/[id]/page.js",
                                                    lineNumber: 1017,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex items-center gap-1 mt-0.5",
                                                    children: editingItineraryTravelers ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "flex items-center gap-1",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                type: "number",
                                                                min: "1",
                                                                max: "50",
                                                                value: itineraryTravelersValue,
                                                                onChange: (e)=>setItineraryTravelersValue(e.target.value),
                                                                onBlur: ()=>saveItineraryTravelers(),
                                                                onKeyDown: (e)=>{
                                                                    if (e.key === "Enter") saveItineraryTravelers();
                                                                    if (e.key === "Escape") setEditingItineraryTravelers(false);
                                                                },
                                                                autoFocus: true,
                                                                className: "w-12 text-xs text-stone-600 bg-white border border-stone-300 rounded px-1 py-0.5 focus:outline-none focus:ring-1 focus:ring-[#da7b4a]/50"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/trips/[id]/page.js",
                                                                lineNumber: 1045,
                                                                columnNumber: 25
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "text-xs text-stone-400",
                                                                children: "travelers"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/trips/[id]/page.js",
                                                                lineNumber: 1056,
                                                                columnNumber: 25
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/app/trips/[id]/page.js",
                                                        lineNumber: 1044,
                                                        columnNumber: 23
                                                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        onClick: ()=>{
                                                            setEditingItineraryTravelers(true);
                                                            setItineraryTravelersValue(activeItinerary?.num_travelers || trip?.num_travelers || 1);
                                                        },
                                                        className: "text-xs text-stone-400 cursor-text hover:text-[#da7b4a] transition-colors",
                                                        title: "Click to edit travelers",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                                                className: "w-3 h-3 inline mr-0.5 -mt-0.5",
                                                                fill: "none",
                                                                stroke: "currentColor",
                                                                viewBox: "0 0 24 24",
                                                                strokeWidth: 2,
                                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                                    strokeLinecap: "round",
                                                                    strokeLinejoin: "round",
                                                                    d: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/app/trips/[id]/page.js",
                                                                    lineNumber: 1064,
                                                                    columnNumber: 142
                                                                }, this)
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/trips/[id]/page.js",
                                                                lineNumber: 1064,
                                                                columnNumber: 25
                                                            }, this),
                                                            activeItinerary?.num_travelers || trip?.num_travelers || 1,
                                                            " traveler",
                                                            (activeItinerary?.num_travelers || trip?.num_travelers || 1) > 1 ? "s" : ""
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/app/trips/[id]/page.js",
                                                        lineNumber: 1059,
                                                        columnNumber: 23
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/trips/[id]/page.js",
                                                    lineNumber: 1042,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/trips/[id]/page.js",
                                            lineNumber: 1015,
                                            columnNumber: 17
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/trips/[id]/page.js",
                                        lineNumber: 1013,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-end justify-between mt-2",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "w-full max-w-md",
                                                children: editingItineraryDesc ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                                                    value: itineraryDescValue,
                                                    onChange: (e)=>setItineraryDescValue(e.target.value),
                                                    onBlur: ()=>saveItineraryDescription(),
                                                    onKeyDown: (e)=>{
                                                        if (e.key === "Escape") setEditingItineraryDesc(false);
                                                    },
                                                    autoFocus: true,
                                                    rows: 1,
                                                    placeholder: "Add itinerary description...",
                                                    className: "w-full text-sm text-stone-600 bg-white border border-stone-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#da7b4a]/50 resize-none min-h-[32px] max-h-[32px] overflow-y-auto"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/trips/[id]/page.js",
                                                    lineNumber: 1078,
                                                    columnNumber: 21
                                                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    onClick: ()=>{
                                                        setEditingItineraryDesc(true);
                                                        setItineraryDescValue(activeItinerary?.description || "");
                                                    },
                                                    className: `text-sm px-2 py-1 rounded-lg cursor-text whitespace-pre-wrap transition-colors border border-stone-300 ${activeItinerary?.description ? "text-stone-600" : "text-stone-300 italic hover:bg-stone-50"}`,
                                                    title: "Click to edit description",
                                                    children: activeItinerary?.description || "Add itinerary description..."
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/trips/[id]/page.js",
                                                    lineNumber: 1089,
                                                    columnNumber: 21
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/trips/[id]/page.js",
                                                lineNumber: 1076,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex-shrink-0 text-right",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "text-[10px] font-semibold text-stone-400 uppercase tracking-widest mb-0.5",
                                                        children: "Calendar View"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/trips/[id]/page.js",
                                                        lineNumber: 1105,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "text-sm font-medium text-stone-400 tracking-wide",
                                                        children: getCalendarTitle()
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/trips/[id]/page.js",
                                                        lineNumber: 1106,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/trips/[id]/page.js",
                                                lineNumber: 1104,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/trips/[id]/page.js",
                                        lineNumber: 1074,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/trips/[id]/page.js",
                                lineNumber: 1012,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "grid grid-cols-7 border-b border-stone-200/60",
                                style: {
                                    background: "rgba(245, 240, 232, 0.6)"
                                },
                                children: [
                                    "Sun",
                                    "Mon",
                                    "Tue",
                                    "Wed",
                                    "Thu",
                                    "Fri",
                                    "Sat"
                                ].map((d)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "py-2.5 text-center text-[10px] font-semibold text-stone-400 uppercase tracking-widest",
                                        children: d
                                    }, d, false, {
                                        fileName: "[project]/src/app/trips/[id]/page.js",
                                        lineNumber: 1114,
                                        columnNumber: 17
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/src/app/trips/[id]/page.js",
                                lineNumber: 1112,
                                columnNumber: 13
                            }, this),
                            weeks.map((week, wi)=>{
                                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "grid grid-cols-7",
                                        children: week.map((date)=>{
                                            const dateKey = formatDateKey(date);
                                            const inRange = effectiveStart && effectiveEnd && isInRange(date, effectiveStart, effectiveEnd);
                                            const isStart = dateKey === effectiveStart;
                                            const isEnd = dateKey === effectiveEnd;
                                            const isToday = dateKey === today;
                                            const dayData = days[dateKey];
                                            const dayActivities = dayData ? activities[dayData.id] || [] : [];
                                            const isSelected = selectedDay === dateKey;
                                            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: `
                            relative p-1.5 border-r-2 border-b-2 border-stone-300/70 last:border-r-0 rounded-lg
                            transition-colors duration-200 flex flex-col
                            ${inRange ? "min-h-[100px] bg-[#da7b4a]/[0.15]" : "min-h-[80px] bg-stone-50/30 hover:bg-stone-50/60"}
                            ${isStart ? "bg-[#da7b4a]/[0.32]" : ""}
                            ${isEnd ? "bg-[#da7b4a]/[0.32]" : ""}
                          `,
                                                onMouseEnter: ()=>{
                                                    setHoveredDay(dateKey);
                                                    handleMouseEnter(dateKey);
                                                },
                                                onMouseLeave: ()=>setHoveredDay(null),
                                                onMouseDown: (e)=>handleMouseDown(dateKey, e),
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "flex items-center justify-between mb-0.5 cursor-pointer",
                                                        onClick: (e)=>{
                                                            if (inRange) {
                                                                e.stopPropagation();
                                                                setSelectedDay(dateKey);
                                                            }
                                                        },
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: `
                                text-xs font-medium leading-none
                                ${isToday ? "bg-[#da7b4a] text-white w-6 h-6 rounded-full flex items-center justify-center text-[11px]" : ""}
                                ${inRange && !isToday ? "text-stone-800" : "text-stone-400"}
                              `,
                                                                children: date.getDate()
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/trips/[id]/page.js",
                                                                lineNumber: 1157,
                                                                columnNumber: 29
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "flex items-center gap-0.5",
                                                                children: [
                                                                    (isStart || isEnd) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        className: "text-stone-400 cursor-ew-resize text-[10px] font-bold",
                                                                        title: `Drag to adjust trip ${isStart ? "start" : "end"}`,
                                                                        onClick: (e)=>e.stopPropagation(),
                                                                        children: "\u27F7"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/app/trips/[id]/page.js",
                                                                        lineNumber: 1168,
                                                                        columnNumber: 33
                                                                    }, this),
                                                                    inRange && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                        className: `w-4 h-4 rounded-full flex items-center justify-center text-stone-400 hover:text-[#da7b4a] hover:bg-[#da7b4a]/10 transition-all ${hoveredDay === dateKey ? "opacity-100" : "opacity-0"}`,
                                                                        title: "View day details",
                                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                                                            xmlns: "http://www.w3.org/2000/svg",
                                                                            viewBox: "0 0 16 16",
                                                                            fill: "currentColor",
                                                                            className: "w-3 h-3",
                                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                                                d: "M8.75 3.75a.75.75 0 0 0-1.5 0v3.5h-3.5a.75.75 0 0 0 0 1.5h3.5v3.5a.75.75 0 0 0 1.5 0v-3.5h3.5a.75.75 0 0 0 0-1.5h-3.5v-3.5Z"
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/src/app/trips/[id]/page.js",
                                                                                lineNumber: 1175,
                                                                                columnNumber: 135
                                                                            }, this)
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/src/app/trips/[id]/page.js",
                                                                            lineNumber: 1175,
                                                                            columnNumber: 35
                                                                        }, this)
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/app/trips/[id]/page.js",
                                                                        lineNumber: 1171,
                                                                        columnNumber: 33
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/src/app/trips/[id]/page.js",
                                                                lineNumber: 1166,
                                                                columnNumber: 29
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/app/trips/[id]/page.js",
                                                        lineNumber: 1153,
                                                        columnNumber: 27
                                                    }, this),
                                                    inRange && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "pb-1 mb-1 border-b border-stone-400/60 flex items-center min-h-[18px]",
                                                        children: editingDayHeader === dateKey ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                            type: "text",
                                                            value: dayHeaderValue,
                                                            onChange: (e)=>setDayHeaderValue(e.target.value),
                                                            onBlur: ()=>saveDayHeader(dateKey),
                                                            onKeyDown: (e)=>{
                                                                if (e.key === "Enter") saveDayHeader(dateKey);
                                                                if (e.key === "Escape") setEditingDayHeader(null);
                                                            },
                                                            autoFocus: true,
                                                            placeholder: "Day title...",
                                                            className: "w-full text-[10px] font-semibold px-1 py-0.5 border border-stone-300 rounded text-stone-700 bg-white focus:outline-none focus:ring-1 focus:ring-inset focus:ring-[#da7b4a]"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/trips/[id]/page.js",
                                                            lineNumber: 1185,
                                                            columnNumber: 33
                                                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            onClick: (e)=>{
                                                                e.stopPropagation();
                                                                setEditingDayHeader(dateKey);
                                                                setDayHeaderValue(dayData?.title || "");
                                                            },
                                                            className: `w-full text-[10px] font-semibold px-1 py-0.5 cursor-text truncate min-h-[16px] ${dayData?.title ? "text-stone-700" : "text-transparent"}`,
                                                            title: dayData?.title || "Click to add day title",
                                                            children: dayData?.title || ""
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/trips/[id]/page.js",
                                                            lineNumber: 1196,
                                                            columnNumber: 33
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/trips/[id]/page.js",
                                                        lineNumber: 1183,
                                                        columnNumber: 29
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "flex-1 space-y-0.5 overflow-hidden",
                                                        children: (()=>{
                                                            const flightsArr = getFlightsOnDate(dateKey).map((f)=>({
                                                                    ...f,
                                                                    _type: "flight",
                                                                    _time: f.departure_time || null,
                                                                    _name: `${f.departure_airport}\u2192${f.arrival_airport}`
                                                                }));
                                                            const acts = getScheduledActivities(dateKey).map((a)=>({
                                                                    ...a,
                                                                    _type: "activity",
                                                                    _time: a.start_time || null,
                                                                    _name: a.name
                                                                }));
                                                            const dining = getScheduledDining(dateKey).map((d)=>({
                                                                    ...d,
                                                                    _type: "dining",
                                                                    _time: d.start_time || null,
                                                                    _name: d.name
                                                                }));
                                                            const transport = getScheduledTransport(dateKey).map((t)=>{
                                                                const isReturnT = t.arrival_date === dateKey && t.departure_date !== dateKey;
                                                                return {
                                                                    ...t,
                                                                    _type: "transportation",
                                                                    _isReturn: isReturnT,
                                                                    _time: isReturnT ? t.arrival_time || null : t.departure_time || null,
                                                                    _name: `${isReturnT ? "\u21A9 " : ""}${t.name}`
                                                                };
                                                            });
                                                            // Day events (activities from the day detail card)
                                                            const dayEvts = dayActivities.map((a)=>({
                                                                    ...a,
                                                                    _type: "dayEvent",
                                                                    _time: a.start_time?.slice(0, 5) || null,
                                                                    _name: a.title
                                                                }));
                                                            const allEvents = [
                                                                ...flightsArr,
                                                                ...acts,
                                                                ...dining,
                                                                ...transport,
                                                                ...dayEvts
                                                            ];
                                                            const timed = allEvents.filter((e)=>e._time).sort((a, b)=>a._time.localeCompare(b._time));
                                                            const untimed = allEvents.filter((e)=>!e._time);
                                                            // Apply saved untimed order from dayData
                                                            const savedOrder = dayData?.untimed_order;
                                                            if (savedOrder && Array.isArray(savedOrder)) {
                                                                untimed.sort((a, b)=>{
                                                                    const aKey = a.id ? `${a._type === "dayEvent" ? "user" : a._type}-${a.id}` : null;
                                                                    const bKey = b.id ? `${b._type === "dayEvent" ? "user" : b._type}-${b.id}` : null;
                                                                    const aIdx = aKey ? savedOrder.indexOf(aKey) : -1;
                                                                    const bIdx = bKey ? savedOrder.indexOf(bKey) : -1;
                                                                    if (aIdx === -1 && bIdx === -1) return 0;
                                                                    if (aIdx === -1) return 1;
                                                                    if (bIdx === -1) return -1;
                                                                    return aIdx - bIdx;
                                                                });
                                                            }
                                                            const sorted = [
                                                                ...untimed,
                                                                ...timed
                                                            ];
                                                            const colorMap = {
                                                                flight: `${__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$categoryColors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].flight.bgMedium} ${__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$categoryColors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].flight.text}`,
                                                                activity: `${__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$categoryColors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].activity.bgMedium} ${__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$categoryColors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].activity.text}`,
                                                                dayEvent: `${__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$categoryColors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].dayEvent.bgMedium} ${__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$categoryColors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].dayEvent.text}`,
                                                                dining: `${__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$categoryColors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].dining.bgMedium} ${__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$categoryColors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].dining.text}`,
                                                                transportation: `${__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$categoryColors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].transportation.bgMedium} ${__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$categoryColors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].transportation.text}`
                                                            };
                                                            const iconMap = {
                                                                flight: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                                                    xmlns: "http://www.w3.org/2000/svg",
                                                                    viewBox: "0 0 20 20",
                                                                    fill: "currentColor",
                                                                    className: "w-2.5 h-2.5 flex-shrink-0",
                                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                                        d: "M3.105 2.288a.75.75 0 0 0-.826.95l1.414 4.926A1.5 1.5 0 0 0 5.135 9.25h6.115a.75.75 0 0 1 0 1.5H5.135a1.5 1.5 0 0 0-1.442 1.086l-1.414 4.926a.75.75 0 0 0 .826.95 28.897 28.897 0 0 0 15.293-7.154.75.75 0 0 0 0-1.115A28.897 28.897 0 0 0 3.105 2.289Z"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/app/trips/[id]/page.js",
                                                                        lineNumber: 1252,
                                                                        columnNumber: 159
                                                                    }, this)
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/app/trips/[id]/page.js",
                                                                    lineNumber: 1252,
                                                                    columnNumber: 41
                                                                }, this),
                                                                activity: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                                                    xmlns: "http://www.w3.org/2000/svg",
                                                                    viewBox: "0 0 20 20",
                                                                    fill: "currentColor",
                                                                    className: "w-2.5 h-2.5 flex-shrink-0",
                                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                                        fillRule: "evenodd",
                                                                        d: "M8.157 2.176a1.5 1.5 0 0 0-1.147 0l-4.084 1.69A1.5 1.5 0 0 0 2 5.25v10.877a1.5 1.5 0 0 0 2.074 1.386l3.51-1.452 4.26 1.762a1.5 1.5 0 0 0 1.147 0l4.084-1.69A1.5 1.5 0 0 0 18 14.75V3.873a1.5 1.5 0 0 0-2.074-1.386l-3.51 1.452-4.26-1.762ZM7.58 5a.75.75 0 0 1 .75.75v6.5a.75.75 0 0 1-1.5 0v-6.5A.75.75 0 0 1 7.58 5Zm5.59 2a.75.75 0 0 1 .75.75v6.5a.75.75 0 0 1-1.5 0v-6.5a.75.75 0 0 1 .75-.75Z",
                                                                        clipRule: "evenodd"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/app/trips/[id]/page.js",
                                                                        lineNumber: 1253,
                                                                        columnNumber: 161
                                                                    }, this)
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/app/trips/[id]/page.js",
                                                                    lineNumber: 1253,
                                                                    columnNumber: 43
                                                                }, this),
                                                                dining: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                                                    xmlns: "http://www.w3.org/2000/svg",
                                                                    fill: "none",
                                                                    viewBox: "0 0 24 24",
                                                                    strokeWidth: 2,
                                                                    stroke: "currentColor",
                                                                    className: "w-2.5 h-2.5 flex-shrink-0",
                                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                                        strokeLinecap: "round",
                                                                        strokeLinejoin: "round",
                                                                        d: "M12 8.25v-1.5m0 1.5c-1.355 0-2.697.056-4.024.166C6.845 8.51 6 9.473 6 10.608v2.513m6-4.871c1.355 0 2.697.056 4.024.166C17.155 8.51 18 9.473 18 10.608v2.513M15 8.25v-1.5m-6 1.5v-1.5m12 9.75-1.5.75a3.354 3.354 0 0 1-3 0 3.354 3.354 0 0 0-3 0 3.354 3.354 0 0 1-3 0 3.354 3.354 0 0 0-3 0 3.354 3.354 0 0 1-3 0L3 16.5m15-3.379a48.474 48.474 0 0 0-6-.371c-2.032 0-4.034.126-6 .371m12 0c.39.049.777.102 1.163.16 1.07.16 1.837 1.094 1.837 2.175v5.169c0 .621-.504 1.125-1.125 1.125H4.125A1.125 1.125 0 0 1 3 20.625v-5.17c0-1.08.768-2.014 1.837-2.174A47.78 47.78 0 0 1 6 13.12M12.265 3.11a.375.375 0 1 1-.53 0L12 2.845l.265.265Z"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/app/trips/[id]/page.js",
                                                                        lineNumber: 1254,
                                                                        columnNumber: 189
                                                                    }, this)
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/app/trips/[id]/page.js",
                                                                    lineNumber: 1254,
                                                                    columnNumber: 41
                                                                }, this),
                                                                transportation: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                                                    xmlns: "http://www.w3.org/2000/svg",
                                                                    fill: "none",
                                                                    viewBox: "0 0 24 24",
                                                                    strokeWidth: 2,
                                                                    stroke: "currentColor",
                                                                    className: "w-2.5 h-2.5 flex-shrink-0",
                                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                                        strokeLinecap: "round",
                                                                        strokeLinejoin: "round",
                                                                        d: "M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/app/trips/[id]/page.js",
                                                                        lineNumber: 1255,
                                                                        columnNumber: 197
                                                                    }, this)
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/app/trips/[id]/page.js",
                                                                    lineNumber: 1255,
                                                                    columnNumber: 49
                                                                }, this),
                                                                dayEvent: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                                                    xmlns: "http://www.w3.org/2000/svg",
                                                                    viewBox: "0 0 20 20",
                                                                    fill: "currentColor",
                                                                    className: "w-2.5 h-2.5 flex-shrink-0",
                                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                                        d: "M5.127 3.502 5.25 3.5h9.5c.041 0 .082 0 .123.002A2.251 2.251 0 0 0 12.75 2h-5.5a2.25 2.25 0 0 0-2.123 1.502ZM1 10.25A2.25 2.25 0 0 1 3.25 8h13.5A2.25 2.25 0 0 1 19 10.25v5.5A2.25 2.25 0 0 1 16.75 18H3.25A2.25 2.25 0 0 1 1 15.75v-5.5ZM3.25 6.5c-.04 0-.082 0-.123.002A2.25 2.25 0 0 1 5.25 5h9.5c.98 0 1.814.627 2.123 1.502a3.819 3.819 0 0 0-.123-.002H3.25Z"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/app/trips/[id]/page.js",
                                                                        lineNumber: 1256,
                                                                        columnNumber: 161
                                                                    }, this)
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/app/trips/[id]/page.js",
                                                                    lineNumber: 1256,
                                                                    columnNumber: 43
                                                                }, this)
                                                            };
                                                            return sorted.map((evt, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: `flex items-center gap-0.5 ${colorMap[evt._type]} rounded px-1 py-0.5 cursor-pointer hover:brightness-95 transition-all`,
                                                                    onClick: (e)=>{
                                                                        e.stopPropagation();
                                                                        const rect = e.currentTarget.getBoundingClientRect();
                                                                        setEventPopup({
                                                                            type: evt._type,
                                                                            data: evt,
                                                                            dateKey,
                                                                            rect
                                                                        });
                                                                    },
                                                                    children: [
                                                                        iconMap[evt._type],
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                            className: "text-[10px] font-medium truncate",
                                                                            children: [
                                                                                evt._time ? `${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$TimeSelectPopup$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["formatTime12h"])(evt._time.slice(0, 5))} ` : "",
                                                                                evt._name
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/src/app/trips/[id]/page.js",
                                                                            lineNumber: 1270,
                                                                            columnNumber: 35
                                                                        }, this)
                                                                    ]
                                                                }, `${evt._type}-${i}`, true, {
                                                                    fileName: "[project]/src/app/trips/[id]/page.js",
                                                                    lineNumber: 1260,
                                                                    columnNumber: 33
                                                                }, this));
                                                        })()
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/trips/[id]/page.js",
                                                        lineNumber: 1210,
                                                        columnNumber: 27
                                                    }, this),
                                                    inRange && (()=>{
                                                        const accoms = getScheduledAccommodations(dateKey);
                                                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "mt-auto pt-1.5",
                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "border-t border-stone-400/60 pt-1 min-h-[20px]",
                                                                children: accoms.length > 0 ? accoms.map((a)=>{
                                                                    const isCheckIn = a.check_in_date === dateKey;
                                                                    const isCheckOut = a.check_out_date && (()=>{
                                                                        // check-out date is the day AFTER the last night
                                                                        const coDate = new Date(a.check_out_date + "T00:00:00");
                                                                        coDate.setDate(coDate.getDate());
                                                                        return formatDateKey(coDate) === dateKey || dateKey === a.check_out_date;
                                                                    })();
                                                                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                        className: "flex items-center gap-0.5 bg-sky-100/80 text-sky-700 rounded px-1 py-0.5 cursor-pointer hover:brightness-95 transition-all",
                                                                        onClick: (e)=>{
                                                                            e.stopPropagation();
                                                                            const rect = e.currentTarget.getBoundingClientRect();
                                                                            setEventPopup({
                                                                                type: "accommodation",
                                                                                data: a,
                                                                                dateKey,
                                                                                rect
                                                                            });
                                                                        },
                                                                        children: [
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                                                                xmlns: "http://www.w3.org/2000/svg",
                                                                                viewBox: "0 0 20 20",
                                                                                fill: "currentColor",
                                                                                className: "w-2.5 h-2.5 flex-shrink-0",
                                                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                                                    d: "M.75 15.5a.75.75 0 0 0 1.5 0V13h16v2.5a.75.75 0 0 0 1.5 0v-6a.75.75 0 0 0-1.5 0V11H16V4.5A2.5 2.5 0 0 0 13.5 2h-7A2.5 2.5 0 0 0 4 4.5V11H2.25V9.5a.75.75 0 0 0-1.5 0v6ZM5.5 4.5a1 1 0 0 1 1-1h7a1 1 0 0 1 1 1V11h-9V4.5Z"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/src/app/trips/[id]/page.js",
                                                                                    lineNumber: 1304,
                                                                                    columnNumber: 43
                                                                                }, this)
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/src/app/trips/[id]/page.js",
                                                                                lineNumber: 1303,
                                                                                columnNumber: 41
                                                                            }, this),
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                className: "text-[10px] font-medium truncate",
                                                                                children: [
                                                                                    isCheckIn ? "↓ " : "",
                                                                                    a.name
                                                                                ]
                                                                            }, void 0, true, {
                                                                                fileName: "[project]/src/app/trips/[id]/page.js",
                                                                                lineNumber: 1306,
                                                                                columnNumber: 41
                                                                            }, this)
                                                                        ]
                                                                    }, a.id, true, {
                                                                        fileName: "[project]/src/app/trips/[id]/page.js",
                                                                        lineNumber: 1294,
                                                                        columnNumber: 39
                                                                    }, this);
                                                                }) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "h-[14px]"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/app/trips/[id]/page.js",
                                                                    lineNumber: 1312,
                                                                    columnNumber: 37
                                                                }, this)
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/trips/[id]/page.js",
                                                                lineNumber: 1284,
                                                                columnNumber: 33
                                                            }, this)
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/trips/[id]/page.js",
                                                            lineNumber: 1283,
                                                            columnNumber: 31
                                                        }, this);
                                                    })()
                                                ]
                                            }, dateKey, true, {
                                                fileName: "[project]/src/app/trips/[id]/page.js",
                                                lineNumber: 1139,
                                                columnNumber: 25
                                            }, this);
                                        })
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/trips/[id]/page.js",
                                        lineNumber: 1127,
                                        columnNumber: 19
                                    }, this)
                                }, wi, false, {
                                    fileName: "[project]/src/app/trips/[id]/page.js",
                                    lineNumber: 1126,
                                    columnNumber: 17
                                }, this);
                            })
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/trips/[id]/page.js",
                        lineNumber: 1010,
                        columnNumber: 11
                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "text-center py-16 rounded-xl border border-stone-200",
                        style: {
                            background: "rgba(255,255,255,0.4)"
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                xmlns: "http://www.w3.org/2000/svg",
                                viewBox: "0 0 24 24",
                                fill: "currentColor",
                                className: "w-12 h-12 mx-auto mb-3 text-stone-400/50",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                    fillRule: "evenodd",
                                    d: "M6.75 2.25A.75.75 0 0 1 7.5 3v1.5h9V3A.75.75 0 0 1 18 3v1.5h.75a3 3 0 0 1 3 3v11.25a3 3 0 0 1-3 3H5.25a3 3 0 0 1-3-3V7.5a3 3 0 0 1 3-3H6V3a.75.75 0 0 1 .75-.75Zm13.5 9a1.5 1.5 0 0 0-1.5-1.5H5.25a1.5 1.5 0 0 0-1.5 1.5v7.5a1.5 1.5 0 0 0 1.5 1.5h13.5a1.5 1.5 0 0 0 1.5-1.5v-7.5Z",
                                    clipRule: "evenodd"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/trips/[id]/page.js",
                                    lineNumber: 1329,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/app/trips/[id]/page.js",
                                lineNumber: 1328,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                className: "text-lg font-semibold text-stone-600 mb-2",
                                children: "No dates set"
                            }, void 0, false, {
                                fileName: "[project]/src/app/trips/[id]/page.js",
                                lineNumber: 1331,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-stone-400 text-sm",
                                children: "Edit your trip to add start and end dates."
                            }, void 0, false, {
                                fileName: "[project]/src/app/trips/[id]/page.js",
                                lineNumber: 1332,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/trips/[id]/page.js",
                        lineNumber: 1327,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mt-8",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex flex-wrap gap-1 mb-0",
                                children: [
                                    [
                                        {
                                            key: "flights",
                                            label: "Flights",
                                            color: "#059669",
                                            icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                                xmlns: "http://www.w3.org/2000/svg",
                                                viewBox: "0 0 20 20",
                                                fill: "currentColor",
                                                className: "w-4 h-4",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                    d: "M3.105 2.288a.75.75 0 0 0-.826.95l1.414 4.926A1.5 1.5 0 0 0 5.135 9.25h6.115a.75.75 0 0 1 0 1.5H5.135a1.5 1.5 0 0 0-1.442 1.086l-1.414 4.926a.75.75 0 0 0 .826.95 28.897 28.897 0 0 0 15.293-7.154.75.75 0 0 0 0-1.115A28.897 28.897 0 0 0 3.105 2.289Z"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/trips/[id]/page.js",
                                                    lineNumber: 1340,
                                                    columnNumber: 175
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/trips/[id]/page.js",
                                                lineNumber: 1340,
                                                columnNumber: 75
                                            }, this)
                                        },
                                        {
                                            key: "accommodations",
                                            label: "Stays",
                                            color: "#0284c7",
                                            icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                                xmlns: "http://www.w3.org/2000/svg",
                                                viewBox: "0 0 20 20",
                                                fill: "currentColor",
                                                className: "w-4 h-4",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                    d: "M.75 15.5a.75.75 0 0 0 1.5 0V13h16v2.5a.75.75 0 0 0 1.5 0v-6a.75.75 0 0 0-1.5 0V11H16V4.5A2.5 2.5 0 0 0 13.5 2h-7A2.5 2.5 0 0 0 4 4.5V11H2.25V9.5a.75.75 0 0 0-1.5 0v6ZM5.5 4.5a1 1 0 0 1 1-1h7a1 1 0 0 1 1 1V11h-9V4.5Z"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/trips/[id]/page.js",
                                                    lineNumber: 1341,
                                                    columnNumber: 180
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/trips/[id]/page.js",
                                                lineNumber: 1341,
                                                columnNumber: 80
                                            }, this)
                                        },
                                        {
                                            key: "activities",
                                            label: "Activities",
                                            color: "#ca8a04",
                                            icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                                xmlns: "http://www.w3.org/2000/svg",
                                                viewBox: "0 0 20 20",
                                                fill: "currentColor",
                                                className: "w-4 h-4",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                    fillRule: "evenodd",
                                                    d: "M8.157 2.176a1.5 1.5 0 0 0-1.147 0l-4.084 1.69A1.5 1.5 0 0 0 2 5.25v10.877a1.5 1.5 0 0 0 2.074 1.386l3.51-1.452 4.26 1.762a1.5 1.5 0 0 0 1.147 0l4.084-1.69A1.5 1.5 0 0 0 18 14.75V3.873a1.5 1.5 0 0 0-2.074-1.386l-3.51 1.452-4.26-1.762ZM7.58 5a.75.75 0 0 1 .75.75v6.5a.75.75 0 0 1-1.5 0v-6.5A.75.75 0 0 1 7.58 5Zm5.59 2a.75.75 0 0 1 .75.75v6.5a.75.75 0 0 1-1.5 0v-6.5a.75.75 0 0 1 .75-.75Z",
                                                    clipRule: "evenodd"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/trips/[id]/page.js",
                                                    lineNumber: 1342,
                                                    columnNumber: 181
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/trips/[id]/page.js",
                                                lineNumber: 1342,
                                                columnNumber: 81
                                            }, this)
                                        },
                                        {
                                            key: "dining",
                                            label: "Dining",
                                            color: "#ea580c",
                                            icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                                xmlns: "http://www.w3.org/2000/svg",
                                                fill: "none",
                                                viewBox: "0 0 24 24",
                                                strokeWidth: 1.5,
                                                stroke: "currentColor",
                                                className: "w-4 h-4",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                    strokeLinecap: "round",
                                                    strokeLinejoin: "round",
                                                    d: "M12 8.25v-1.5m0 1.5c-1.355 0-2.697.056-4.024.166C6.845 8.51 6 9.473 6 10.608v2.513m6-4.871c1.355 0 2.697.056 4.024.166C17.155 8.51 18 9.473 18 10.608v2.513M15 8.25v-1.5m-6 1.5v-1.5m12 9.75-1.5.75a3.354 3.354 0 0 1-3 0 3.354 3.354 0 0 0-3 0 3.354 3.354 0 0 1-3 0 3.354 3.354 0 0 0-3 0 3.354 3.354 0 0 1-3 0L3 16.5m15-3.379a48.474 48.474 0 0 0-6-.371c-2.032 0-4.034.126-6 .371m12 0c.39.049.777.102 1.163.16 1.07.16 1.837 1.094 1.837 2.175v5.169c0 .621-.504 1.125-1.125 1.125H4.125A1.125 1.125 0 0 1 3 20.625v-5.17c0-1.08.768-2.014 1.837-2.174A47.78 47.78 0 0 1 6 13.12M12.265 3.11a.375.375 0 1 1-.53 0L12 2.845l.265.265Z"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/trips/[id]/page.js",
                                                    lineNumber: 1343,
                                                    columnNumber: 205
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/trips/[id]/page.js",
                                                lineNumber: 1343,
                                                columnNumber: 73
                                            }, this)
                                        },
                                        {
                                            key: "transportation",
                                            label: "Transportation",
                                            color: "#7c3aed",
                                            icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                                xmlns: "http://www.w3.org/2000/svg",
                                                fill: "none",
                                                viewBox: "0 0 24 24",
                                                strokeWidth: 1.5,
                                                stroke: "currentColor",
                                                className: "w-4 h-4",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                    strokeLinecap: "round",
                                                    strokeLinejoin: "round",
                                                    d: "M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/trips/[id]/page.js",
                                                    lineNumber: 1344,
                                                    columnNumber: 221
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/trips/[id]/page.js",
                                                lineNumber: 1344,
                                                columnNumber: 89
                                            }, this)
                                        }
                                    ].map((tab)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: ()=>setActiveItineraryTab(tab.key),
                                            className: `flex items-center gap-2 px-5 py-2.5 rounded-t-lg text-sm font-semibold transition-all ${activeItineraryTab === tab.key ? "text-stone-800" : "text-stone-500 hover:text-stone-700"}`,
                                            style: {
                                                background: activeItineraryTab === tab.key ? "rgba(255,255,255,0.6)" : "rgba(195,178,155,0.35)",
                                                borderTop: activeItineraryTab === tab.key ? `2px solid ${tab.color}` : "2px solid transparent",
                                                borderLeft: activeItineraryTab === tab.key ? "1px solid rgba(180,165,140,0.3)" : "1px solid rgba(180,165,140,0.15)",
                                                borderRight: activeItineraryTab === tab.key ? "1px solid rgba(180,165,140,0.3)" : "1px solid rgba(180,165,140,0.15)",
                                                borderBottom: activeItineraryTab === tab.key ? "1px solid rgba(255,255,255,0.6)" : "1px solid rgba(180,165,140,0.3)"
                                            },
                                            children: [
                                                tab.icon,
                                                tab.label
                                            ]
                                        }, tab.key, true, {
                                            fileName: "[project]/src/app/trips/[id]/page.js",
                                            lineNumber: 1346,
                                            columnNumber: 15
                                        }, this)),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: ()=>setActiveItineraryTab("budget"),
                                        className: `flex items-center gap-2 px-5 py-2.5 rounded-t-lg text-sm font-semibold transition-all ml-auto ${activeItineraryTab === "budget" ? "text-stone-800" : "text-stone-500 hover:text-stone-700"}`,
                                        style: {
                                            background: activeItineraryTab === "budget" ? "rgba(255,255,255,0.6)" : "rgba(195,178,155,0.35)",
                                            borderTop: activeItineraryTab === "budget" ? "2px solid #b5552a" : "2px solid transparent",
                                            borderLeft: activeItineraryTab === "budget" ? "1px solid rgba(180,165,140,0.3)" : "1px solid rgba(180,165,140,0.15)",
                                            borderRight: activeItineraryTab === "budget" ? "1px solid rgba(180,165,140,0.3)" : "1px solid rgba(180,165,140,0.15)",
                                            borderBottom: activeItineraryTab === "budget" ? "1px solid rgba(255,255,255,0.6)" : "1px solid rgba(180,165,140,0.3)"
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                                className: "w-4 h-4",
                                                fill: "none",
                                                stroke: "currentColor",
                                                viewBox: "0 0 24 24",
                                                strokeWidth: 2,
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                    strokeLinecap: "round",
                                                    strokeLinejoin: "round",
                                                    d: "M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/trips/[id]/page.js",
                                                    lineNumber: 1403,
                                                    columnNumber: 110
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/trips/[id]/page.js",
                                                lineNumber: 1403,
                                                columnNumber: 15
                                            }, this),
                                            "Budget"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/trips/[id]/page.js",
                                        lineNumber: 1378,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/trips/[id]/page.js",
                                lineNumber: 1338,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "rounded-b-xl rounded-tr-xl px-4 py-2",
                                style: {
                                    background: "rgba(255,255,255,0.6)",
                                    border: "1px solid rgba(180,165,140,0.3)",
                                    borderTop: activeItineraryTab === "flights" ? "none" : "1px solid rgba(180,165,140,0.3)",
                                    minHeight: "200px"
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            display: activeItineraryTab === "flights" ? "block" : "none"
                                        },
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$FlightOptions$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                            tripId: params.id,
                                            tripStart: trip?.start_date,
                                            tripEnd: trip?.end_date,
                                            onFlightOptionsChange: setFlightOptions,
                                            itinerarySelections: itinerarySelections,
                                            activeItineraryId: activeItineraryId,
                                            onToggleSelection: toggleSelection
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/trips/[id]/page.js",
                                            lineNumber: 1419,
                                            columnNumber: 15
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/trips/[id]/page.js",
                                        lineNumber: 1418,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            display: activeItineraryTab === "accommodations" ? "block" : "none"
                                        },
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$AccommodationOptions$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                            tripId: params.id,
                                            tripStart: trip?.start_date,
                                            tripEnd: trip?.end_date,
                                            onAccommodationOptionsChange: setAccommodationOptions,
                                            itinerarySelections: itinerarySelections,
                                            activeItineraryId: activeItineraryId,
                                            onToggleSelection: toggleSelection
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/trips/[id]/page.js",
                                            lineNumber: 1430,
                                            columnNumber: 15
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/trips/[id]/page.js",
                                        lineNumber: 1429,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            display: activeItineraryTab === "activities" ? "block" : "none"
                                        },
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ActivityOptions$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                            tripId: params.id,
                                            tripStart: activeItinerary?.start_date || trip?.start_date,
                                            tripEnd: activeItinerary?.end_date || trip?.end_date,
                                            onActivityOptionsChange: setActivityOptions,
                                            itinerarySelections: itinerarySelections,
                                            activeItineraryId: activeItineraryId,
                                            onToggleSelection: toggleSelection
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/trips/[id]/page.js",
                                            lineNumber: 1441,
                                            columnNumber: 15
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/trips/[id]/page.js",
                                        lineNumber: 1440,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            display: activeItineraryTab === "dining" ? "block" : "none"
                                        },
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$DiningOptions$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                            tripId: params.id,
                                            tripStart: activeItinerary?.start_date || trip?.start_date,
                                            tripEnd: activeItinerary?.end_date || trip?.end_date,
                                            onDiningOptionsChange: setDiningOptions,
                                            itinerarySelections: itinerarySelections,
                                            activeItineraryId: activeItineraryId,
                                            onToggleSelection: toggleSelection
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/trips/[id]/page.js",
                                            lineNumber: 1452,
                                            columnNumber: 15
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/trips/[id]/page.js",
                                        lineNumber: 1451,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            display: activeItineraryTab === "transportation" ? "block" : "none"
                                        },
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$TransportationOptions$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                            tripId: params.id,
                                            tripStart: trip?.start_date,
                                            tripEnd: trip?.end_date,
                                            onTransportationOptionsChange: setTransportOptions,
                                            itinerarySelections: itinerarySelections,
                                            activeItineraryId: activeItineraryId,
                                            onToggleSelection: toggleSelection
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/trips/[id]/page.js",
                                            lineNumber: 1463,
                                            columnNumber: 15
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/trips/[id]/page.js",
                                        lineNumber: 1462,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            display: activeItineraryTab === "budget" ? "block" : "none"
                                        },
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$BudgetTracker$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                            tripId: params.id,
                                            numTravelers: activeItinerary?.num_travelers || trip?.num_travelers || 1,
                                            flightOptions: flightOptions,
                                            activityOptions: activityOptions,
                                            accommodationOptions: accommodationOptions,
                                            diningOptions: diningOptions,
                                            transportOptions: transportOptions,
                                            itinerarySelections: itinerarySelections
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/trips/[id]/page.js",
                                            lineNumber: 1474,
                                            columnNumber: 15
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/trips/[id]/page.js",
                                        lineNumber: 1473,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/trips/[id]/page.js",
                                lineNumber: 1409,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/trips/[id]/page.js",
                        lineNumber: 1337,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mt-10",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex flex-wrap gap-1 mb-0",
                                children: [
                                    {
                                        key: "map",
                                        label: "Map",
                                        color: "#0d9488",
                                        icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                            className: "w-4 h-4",
                                            xmlns: "http://www.w3.org/2000/svg",
                                            viewBox: "0 0 20 20",
                                            fill: "currentColor",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                fillRule: "evenodd",
                                                d: "m9.69 18.933.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 0 0 .281-.145c.186-.1.429-.24.713-.42.567-.362 1.308-.892 2.052-1.586C14.786 15.396 16.5 13.134 16.5 10a6.5 6.5 0 1 0-13 0c0 3.134 1.714 5.396 3.12 6.771.744.694 1.485 1.224 2.052 1.586a13.73 13.73 0 0 0 .994.565l.018.008.006.003ZM10 11.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z",
                                                clipRule: "evenodd"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/trips/[id]/page.js",
                                                lineNumber: 1496,
                                                columnNumber: 123
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/trips/[id]/page.js",
                                            lineNumber: 1496,
                                            columnNumber: 23
                                        }, this)
                                    },
                                    {
                                        key: "checklist",
                                        label: "Checklist",
                                        color: "#f59e0b",
                                        icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                            className: "w-4 h-4",
                                            fill: "none",
                                            stroke: "currentColor",
                                            viewBox: "0 0 24 24",
                                            strokeWidth: 2,
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                strokeLinecap: "round",
                                                strokeLinejoin: "round",
                                                d: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/trips/[id]/page.js",
                                                lineNumber: 1502,
                                                columnNumber: 118
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/trips/[id]/page.js",
                                            lineNumber: 1502,
                                            columnNumber: 23
                                        }, this)
                                    },
                                    {
                                        key: "packing",
                                        label: "Packing",
                                        color: "#6366f1",
                                        icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                            className: "w-4 h-4",
                                            fill: "none",
                                            stroke: "currentColor",
                                            viewBox: "0 0 24 24",
                                            strokeWidth: 2,
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                strokeLinecap: "round",
                                                strokeLinejoin: "round",
                                                d: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/trips/[id]/page.js",
                                                lineNumber: 1508,
                                                columnNumber: 118
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/trips/[id]/page.js",
                                            lineNumber: 1508,
                                            columnNumber: 23
                                        }, this)
                                    },
                                    {
                                        key: "documents",
                                        label: "Resources",
                                        color: "#f43f5e",
                                        icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                            className: "w-4 h-4",
                                            fill: "none",
                                            stroke: "currentColor",
                                            viewBox: "0 0 24 24",
                                            strokeWidth: 2,
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                strokeLinecap: "round",
                                                strokeLinejoin: "round",
                                                d: "M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/trips/[id]/page.js",
                                                lineNumber: 1514,
                                                columnNumber: 118
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/trips/[id]/page.js",
                                            lineNumber: 1514,
                                            columnNumber: 23
                                        }, this)
                                    },
                                    {
                                        key: "collaborators",
                                        label: "Collaborators",
                                        color: "#8b5cf6",
                                        icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                            className: "w-4 h-4",
                                            xmlns: "http://www.w3.org/2000/svg",
                                            viewBox: "0 0 20 20",
                                            fill: "currentColor",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                d: "M7 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm7.5 1a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM1.615 16.428a1.224 1.224 0 0 1-.569-1.175 6.002 6.002 0 0 1 11.908 0c.058.467-.172.92-.57 1.174A9.953 9.953 0 0 1 7 18a9.953 9.953 0 0 1-5.385-1.572ZM14.5 16h-.106c.07-.297.088-.611.048-.933a7.47 7.47 0 0 0-1.588-3.755 4.502 4.502 0 0 1 5.874 2.636.818.818 0 0 1-.36.98A7.465 7.465 0 0 1 14.5 16Z"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/trips/[id]/page.js",
                                                lineNumber: 1520,
                                                columnNumber: 123
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/trips/[id]/page.js",
                                            lineNumber: 1520,
                                            columnNumber: 23
                                        }, this)
                                    }
                                ].map((tab)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: ()=>setActiveLowerTab(tab.key),
                                        className: `flex items-center gap-2 px-5 py-2.5 rounded-t-lg text-sm font-semibold transition-all ${activeLowerTab === tab.key ? "text-stone-800" : "text-stone-500 hover:text-stone-700"}`,
                                        style: {
                                            background: activeLowerTab === tab.key ? "rgba(255,255,255,0.6)" : "rgba(195,178,155,0.35)",
                                            borderTop: activeLowerTab === tab.key ? `2px solid ${tab.color}` : "2px solid transparent",
                                            borderLeft: activeLowerTab === tab.key ? "1px solid rgba(180,165,140,0.3)" : "1px solid rgba(180,165,140,0.15)",
                                            borderRight: activeLowerTab === tab.key ? "1px solid rgba(180,165,140,0.3)" : "1px solid rgba(180,165,140,0.15)",
                                            borderBottom: activeLowerTab === tab.key ? "1px solid rgba(255,255,255,0.6)" : "1px solid rgba(180,165,140,0.3)"
                                        },
                                        children: [
                                            tab.icon,
                                            tab.label
                                        ]
                                    }, tab.key, true, {
                                        fileName: "[project]/src/app/trips/[id]/page.js",
                                        lineNumber: 1523,
                                        columnNumber: 15
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/src/app/trips/[id]/page.js",
                                lineNumber: 1490,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "rounded-b-xl rounded-tr-xl px-4 py-2 overflow-y-auto",
                                style: {
                                    background: "rgba(255,255,255,0.6)",
                                    border: "1px solid rgba(180,165,140,0.3)",
                                    borderTop: activeLowerTab === "map" ? "none" : "1px solid rgba(180,165,140,0.3)",
                                    height: "600px"
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            display: activeLowerTab === "map" ? "block" : "none"
                                        },
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$TripMap$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                            tripDestination: trip?.destination,
                                            tripStart: trip?.start_date,
                                            tripEnd: trip?.end_date,
                                            flightOptions: flightOptions,
                                            accommodationOptions: accommodationOptions,
                                            activityOptions: activityOptions,
                                            diningOptions: diningOptions,
                                            transportOptions: transportOptions,
                                            itinerarySelections: itinerarySelections
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/trips/[id]/page.js",
                                            lineNumber: 1566,
                                            columnNumber: 15
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/trips/[id]/page.js",
                                        lineNumber: 1565,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            display: activeLowerTab === "checklist" ? "block" : "none"
                                        },
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$PlanningChecklist$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                            tripId: params.id
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/trips/[id]/page.js",
                                            lineNumber: 1579,
                                            columnNumber: 15
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/trips/[id]/page.js",
                                        lineNumber: 1578,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            display: activeLowerTab === "packing" ? "block" : "none"
                                        },
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$PackingList$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                            tripId: params.id,
                                            tripDestination: trip?.destination,
                                            tripStartDate: trip?.start_date,
                                            tripEndDate: trip?.end_date,
                                            activityOptions: activityOptions,
                                            accommodationOptions: accommodationOptions
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/trips/[id]/page.js",
                                            lineNumber: 1582,
                                            columnNumber: 15
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/trips/[id]/page.js",
                                        lineNumber: 1581,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            display: activeLowerTab === "documents" ? "block" : "none"
                                        },
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$TravelDocuments$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                            tripId: params.id
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/trips/[id]/page.js",
                                            lineNumber: 1592,
                                            columnNumber: 15
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/trips/[id]/page.js",
                                        lineNumber: 1591,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            display: activeLowerTab === "collaborators" ? "block" : "none"
                                        },
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$TripCollaborators$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                            tripId: params.id,
                                            tripTitle: trip?.title,
                                            userId: currentUser?.id,
                                            userEmail: currentUser?.email,
                                            tripOwnerId: trip?.user_id
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/trips/[id]/page.js",
                                            lineNumber: 1595,
                                            columnNumber: 15
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/trips/[id]/page.js",
                                        lineNumber: 1594,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/trips/[id]/page.js",
                                lineNumber: 1556,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/trips/[id]/page.js",
                        lineNumber: 1489,
                        columnNumber: 9
                    }, this),
                    selectedDay && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(DayPopout, {
                        dateKey: selectedDay,
                        tripId: params.id,
                        tripStart: effectiveStart,
                        dayData: days[selectedDay],
                        activities: days[selectedDay] ? activities[days[selectedDay].id] || [] : [],
                        inRange: effectiveStart && effectiveEnd && selectedDay >= effectiveStart && selectedDay <= effectiveEnd,
                        onClose: ()=>setSelectedDay(null),
                        onUpdate: loadTrip,
                        calendarEvents: {
                            flights: getFlightsOnDate(selectedDay),
                            activities: getScheduledActivities(selectedDay),
                            dining: getScheduledDining(selectedDay),
                            transport: getScheduledTransport(selectedDay),
                            accommodations: getScheduledAccommodations(selectedDay)
                        },
                        activeItineraryId: activeItineraryId
                    }, void 0, false, {
                        fileName: "[project]/src/app/trips/[id]/page.js",
                        lineNumber: 1608,
                        columnNumber: 11
                    }, this),
                    eventPopup && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(EventPopup, {
                        type: eventPopup.type,
                        data: eventPopup.data,
                        dateKey: eventPopup.dateKey,
                        rect: eventPopup.rect,
                        onClose: ()=>setEventPopup(null),
                        onUpdate: loadTrip
                    }, void 0, false, {
                        fileName: "[project]/src/app/trips/[id]/page.js",
                        lineNumber: 1628,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/trips/[id]/page.js",
                lineNumber: 772,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("footer", {
                className: "relative z-10 text-center text-xs text-stone-400 py-4",
                children: "v3.1.0 — Apr 17 2026"
            }, void 0, false, {
                fileName: "[project]/src/app/trips/[id]/page.js",
                lineNumber: 1638,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/trips/[id]/page.js",
        lineNumber: 719,
        columnNumber: 5
    }, this);
}
_s(TripDetailPage, "p/IEjVcomc1bsP7gN9WjFXT9r5Q=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useParams"]
    ];
});
_c = TripDetailPage;
function EventPopup({ type, data, dateKey, rect, onClose, onUpdate }) {
    _s1();
    const [editingNotes, setEditingNotes] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [notesValue, setNotesValue] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(data.notes || "");
    const TABLE_MAP = {
        flight: "flight_options",
        activity: "activity_options",
        dining: "dining_options",
        transportation: "transportation_options",
        accommodation: "accommodation_options",
        dayEvent: "activities"
    };
    async function saveNotes() {
        setEditingNotes(false);
        const newNotes = notesValue.trim() || null;
        if (newNotes === (data.notes || null)) return;
        const table = TABLE_MAP[type];
        if (!table) return;
        // For flights, notes live on the parent option, not the leg
        const recordId = type === "flight" ? data._optionId : data.id;
        if (!recordId) return;
        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from(table).update({
            notes: newNotes
        }).eq("id", recordId);
        if (onUpdate) onUpdate();
    }
    const colors = {
        flight: {
            bg: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$categoryColors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].flight.bg,
            border: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$categoryColors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].flight.border,
            text: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$categoryColors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].flight.text,
            label: "Flight"
        },
        activity: {
            bg: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$categoryColors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].activity.bg,
            border: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$categoryColors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].activity.border,
            text: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$categoryColors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].activity.text,
            label: "Activity"
        },
        accommodation: {
            bg: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$categoryColors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].accommodation.bg,
            border: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$categoryColors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].accommodation.border,
            text: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$categoryColors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].accommodation.text,
            label: "Stay"
        },
        dining: {
            bg: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$categoryColors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].dining.bg,
            border: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$categoryColors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].dining.border,
            text: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$categoryColors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].dining.text,
            label: "Dining"
        },
        transportation: {
            bg: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$categoryColors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].transportation.bg,
            border: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$categoryColors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].transportation.border,
            text: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$categoryColors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].transportation.text,
            label: "Transportation"
        }
    };
    const c = colors[type] || colors.activity;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "fixed inset-0 z-50",
        onClick: onClose,
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: `absolute ${c.bg} ${c.border} border rounded-xl shadow-lg p-4 w-72 z-50`,
            style: {
                top: Math.min(rect.bottom + 4, window.innerHeight - 250),
                left: Math.min(rect.left, window.innerWidth - 300)
            },
            onClick: (e)=>e.stopPropagation(),
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex items-center justify-between mb-2",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: `text-xs font-bold uppercase tracking-wide ${c.text}`,
                            children: c.label
                        }, void 0, false, {
                            fileName: "[project]/src/app/trips/[id]/page.js",
                            lineNumber: 1686,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: onClose,
                            className: "text-stone-400 hover:text-stone-600 text-sm",
                            children: "✕"
                        }, void 0, false, {
                            fileName: "[project]/src/app/trips/[id]/page.js",
                            lineNumber: 1687,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/trips/[id]/page.js",
                    lineNumber: 1685,
                    columnNumber: 9
                }, this),
                type === "flight" ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "text-sm font-semibold text-stone-800 mb-1",
                    children: [
                        data.airline_name || data.airline_code || "",
                        data.flight_number ? ` ${data.flight_number}` : "",
                        !data.airline_name && !data.airline_code && !data.flight_number && `${data.departure_airport} \u2192 ${data.arrival_airport}`
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/trips/[id]/page.js",
                    lineNumber: 1691,
                    columnNumber: 11
                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "text-sm font-semibold text-stone-800 mb-1",
                    children: data.name || data.title || ""
                }, void 0, false, {
                    fileName: "[project]/src/app/trips/[id]/page.js",
                    lineNumber: 1696,
                    columnNumber: 11
                }, this),
                type === "flight" && data.departure_airport && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "space-y-1 mb-1",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center text-xs gap-3",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "font-medium text-stone-600 w-10",
                                    children: data.departure_airport
                                }, void 0, false, {
                                    fileName: "[project]/src/app/trips/[id]/page.js",
                                    lineNumber: 1702,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "text-stone-400 w-12",
                                    children: "Depart"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/trips/[id]/page.js",
                                    lineNumber: 1703,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "text-stone-500",
                                    children: data.departure_time ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$TimeSelectPopup$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["formatTime12h"])(data.departure_time.slice(0, 5)) : "—"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/trips/[id]/page.js",
                                    lineNumber: 1704,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/trips/[id]/page.js",
                            lineNumber: 1701,
                            columnNumber: 13
                        }, this),
                        data.arrival_airport && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center text-xs gap-3",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "font-medium text-stone-600 w-10",
                                    children: data.arrival_airport
                                }, void 0, false, {
                                    fileName: "[project]/src/app/trips/[id]/page.js",
                                    lineNumber: 1708,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "text-stone-400 w-12",
                                    children: "Arrive"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/trips/[id]/page.js",
                                    lineNumber: 1709,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "text-stone-500",
                                    children: data.arrival_time ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$TimeSelectPopup$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["formatTime12h"])(data.arrival_time.slice(0, 5)) : "—"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/trips/[id]/page.js",
                                    lineNumber: 1710,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/trips/[id]/page.js",
                            lineNumber: 1707,
                            columnNumber: 15
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/trips/[id]/page.js",
                    lineNumber: 1700,
                    columnNumber: 11
                }, this),
                type !== "flight" && data.departure_date && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "text-xs text-stone-500",
                    children: new Date(data.departure_date + "T00:00:00").toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric"
                    })
                }, void 0, false, {
                    fileName: "[project]/src/app/trips/[id]/page.js",
                    lineNumber: 1717,
                    columnNumber: 11
                }, this),
                type !== "flight" && data.departure_time && (()=>{
                    if (type === "transportation" && (data.pickup_location || data.dropoff_location)) {
                        const t = data._isReturn ? data.arrival_time : data.departure_time;
                        return t ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "text-xs text-stone-500",
                            children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$TimeSelectPopup$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["formatTime12h"])(t.slice(0, 5))
                        }, void 0, false, {
                            fileName: "[project]/src/app/trips/[id]/page.js",
                            lineNumber: 1723,
                            columnNumber: 24
                        }, this) : null;
                    }
                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "text-xs text-stone-500",
                        children: [
                            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$TimeSelectPopup$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["formatTime12h"])(data.departure_time.slice(0, 5)),
                            data.arrival_time && ` \u2013 ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$TimeSelectPopup$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["formatTime12h"])(data.arrival_time.slice(0, 5))}`
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/trips/[id]/page.js",
                        lineNumber: 1726,
                        columnNumber: 13
                    }, this);
                })(),
                (data.start_time || data.scheduled_date) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "text-xs text-stone-500",
                    children: [
                        data.start_time && (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$TimeSelectPopup$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["formatTime12h"])(data.start_time.slice(0, 5)),
                        data.end_time && ` \u2013 ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$TimeSelectPopup$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["formatTime12h"])(data.end_time.slice(0, 5))}`
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/trips/[id]/page.js",
                    lineNumber: 1733,
                    columnNumber: 11
                }, this),
                type === "transportation" && (data.pickup_location || data.dropoff_location) && (()=>{
                    const loc = data._isReturn ? data.dropoff_location : data.pickup_location;
                    const label = data._isReturn ? "Drop-off" : "Pick-up";
                    if (!loc) return null;
                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                        href: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(loc)}`,
                        target: "_blank",
                        rel: "noopener noreferrer",
                        className: "text-xs text-sky-600 hover:text-sky-800 hover:underline mt-1 flex items-center gap-1 transition-colors",
                        onClick: (e)=>e.stopPropagation(),
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                children: "\uD83D\uDCCD"
                            }, void 0, false, {
                                fileName: "[project]/src/app/trips/[id]/page.js",
                                lineNumber: 1751,
                                columnNumber: 15
                            }, this),
                            " ",
                            label,
                            ": ",
                            loc
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/trips/[id]/page.js",
                        lineNumber: 1744,
                        columnNumber: 13
                    }, this);
                })(),
                !(type === "transportation" && (data.pickup_location || data.dropoff_location)) && (data.address || data.location) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                    href: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(data.address || data.location)}`,
                    target: "_blank",
                    rel: "noopener noreferrer",
                    className: "text-xs text-sky-600 hover:text-sky-800 hover:underline mt-1 flex items-center gap-1 transition-colors",
                    onClick: (e)=>e.stopPropagation(),
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            children: "\uD83D\uDCCD"
                        }, void 0, false, {
                            fileName: "[project]/src/app/trips/[id]/page.js",
                            lineNumber: 1764,
                            columnNumber: 13
                        }, this),
                        " ",
                        data.address || data.location
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/trips/[id]/page.js",
                    lineNumber: 1757,
                    columnNumber: 11
                }, this),
                !(type === "transportation" && (data.pickup_location || data.dropoff_location)) && data.location_name && !data.address && !data.location && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                    href: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(data.location_name)}`,
                    target: "_blank",
                    rel: "noopener noreferrer",
                    className: "text-xs text-sky-600 hover:text-sky-800 hover:underline mt-1 flex items-center gap-1 transition-colors",
                    onClick: (e)=>e.stopPropagation(),
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            children: "\uD83D\uDCCD"
                        }, void 0, false, {
                            fileName: "[project]/src/app/trips/[id]/page.js",
                            lineNumber: 1775,
                            columnNumber: 13
                        }, this),
                        " ",
                        data.location_name
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/trips/[id]/page.js",
                    lineNumber: 1768,
                    columnNumber: 11
                }, this),
                data.check_in_date && data.check_out_date && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "text-xs text-stone-500 mt-1",
                    children: [
                        new Date(data.check_in_date + "T00:00:00").toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric"
                        }),
                        " – ",
                        new Date(data.check_out_date + "T00:00:00").toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric"
                        })
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/trips/[id]/page.js",
                    lineNumber: 1779,
                    columnNumber: 11
                }, this),
                type !== "accommodation" && data.total_price && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "text-xs text-stone-500 mt-1",
                    children: [
                        "$",
                        Number(data.total_price).toLocaleString()
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/trips/[id]/page.js",
                    lineNumber: 1783,
                    columnNumber: 58
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "mt-2",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "text-[10px] font-semibold text-stone-400 uppercase tracking-wide mb-1",
                            children: "Notes"
                        }, void 0, false, {
                            fileName: "[project]/src/app/trips/[id]/page.js",
                            lineNumber: 1786,
                            columnNumber: 11
                        }, this),
                        editingNotes ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                            value: notesValue,
                            onChange: (e)=>setNotesValue(e.target.value),
                            onBlur: saveNotes,
                            onKeyDown: (e)=>{
                                if (e.key === "Escape") {
                                    setNotesValue(data.notes || "");
                                    setEditingNotes(false);
                                }
                            },
                            autoFocus: true,
                            rows: 3,
                            placeholder: "Add notes...",
                            className: "w-full text-xs text-stone-600 bg-white border border-stone-300 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#da7b4a]/50 focus:border-transparent resize-none"
                        }, void 0, false, {
                            fileName: "[project]/src/app/trips/[id]/page.js",
                            lineNumber: 1788,
                            columnNumber: 13
                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            onClick: (e)=>{
                                e.stopPropagation();
                                setEditingNotes(true);
                            },
                            className: `text-xs rounded-lg px-2 py-1.5 cursor-text border border-stone-200/60 min-h-[32px] transition-colors hover:border-stone-300 ${notesValue ? "text-stone-500 italic" : "text-stone-300 italic"}`,
                            children: notesValue || "Add notes..."
                        }, void 0, false, {
                            fileName: "[project]/src/app/trips/[id]/page.js",
                            lineNumber: 1799,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/trips/[id]/page.js",
                    lineNumber: 1785,
                    columnNumber: 9
                }, this),
                (data.source_url || data.screenshot_url) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "mt-2 pt-2 border-t border-stone-200/60",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "text-[10px] font-semibold text-stone-400 uppercase tracking-wide mb-1",
                            children: "Sources"
                        }, void 0, false, {
                            fileName: "[project]/src/app/trips/[id]/page.js",
                            lineNumber: 1812,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center gap-2",
                            children: [
                                data.source_url && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                    href: data.source_url,
                                    target: "_blank",
                                    rel: "noopener noreferrer",
                                    className: "text-xs text-sky-600 hover:text-sky-800 hover:underline flex items-center gap-1 transition-colors",
                                    onClick: (e)=>e.stopPropagation(),
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                            xmlns: "http://www.w3.org/2000/svg",
                                            viewBox: "0 0 16 16",
                                            fill: "currentColor",
                                            className: "w-3 h-3 flex-shrink-0",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                    d: "M8.914 6.025a.75.75 0 0 1 1.06 0 3.5 3.5 0 0 1 0 4.95l-2 2a3.5 3.5 0 0 1-5.396-4.402.75.75 0 0 1 1.251.827 2 2 0 0 0 3.085 2.514l2-2a2 2 0 0 0 0-2.828.75.75 0 0 1 0-1.06Z"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/trips/[id]/page.js",
                                                    lineNumber: 1822,
                                                    columnNumber: 133
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                    d: "M7.086 9.975a.75.75 0 0 1-1.06 0 3.5 3.5 0 0 1 0-4.95l2-2a3.5 3.5 0 0 1 5.396 4.402.75.75 0 0 1-1.251-.827 2 2 0 0 0-3.085-2.514l-2 2a2 2 0 0 0 0 2.828.75.75 0 0 1 0 1.06Z"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/trips/[id]/page.js",
                                                    lineNumber: 1822,
                                                    columnNumber: 316
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/trips/[id]/page.js",
                                            lineNumber: 1822,
                                            columnNumber: 19
                                        }, this),
                                        (()=>{
                                            try {
                                                return new URL(data.source_url).hostname.replace("www.", "");
                                            } catch  {
                                                return "Source";
                                            }
                                        })()
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/trips/[id]/page.js",
                                    lineNumber: 1815,
                                    columnNumber: 17
                                }, this),
                                data.screenshot_url && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    type: "button",
                                    className: "text-xs text-sky-600 hover:text-sky-800 hover:underline flex items-center gap-1 transition-colors",
                                    onClick: (e)=>{
                                        e.stopPropagation();
                                        const w = window.open();
                                        if (w) {
                                            w.document.write(`<html><head><title>Screenshot</title><style>body{margin:0;background:#1a1a1a;display:flex;align-items:center;justify-content:center;min-height:100vh;}</style></head><body><img src="${data.screenshot_url}" style="max-width:100%;max-height:100vh;object-fit:contain;"></body></html>`);
                                            w.document.close();
                                        }
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                            xmlns: "http://www.w3.org/2000/svg",
                                            viewBox: "0 0 16 16",
                                            fill: "currentColor",
                                            className: "w-3 h-3 flex-shrink-0",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                fillRule: "evenodd",
                                                d: "M2 4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V4Zm10.5 5.707a.5.5 0 0 0-.146-.353l-1-1a.5.5 0 0 0-.708 0l-1.5 1.5-2-2a.5.5 0 0 0-.707 0l-2 2A.5.5 0 0 0 5 10.707V12h8V9.707h-.5ZM7 6a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z",
                                                clipRule: "evenodd"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/trips/[id]/page.js",
                                                lineNumber: 1839,
                                                columnNumber: 133
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/trips/[id]/page.js",
                                            lineNumber: 1839,
                                            columnNumber: 19
                                        }, this),
                                        "Screenshot"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/trips/[id]/page.js",
                                    lineNumber: 1827,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/trips/[id]/page.js",
                            lineNumber: 1813,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/trips/[id]/page.js",
                    lineNumber: 1811,
                    columnNumber: 11
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/app/trips/[id]/page.js",
            lineNumber: 1680,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/app/trips/[id]/page.js",
        lineNumber: 1679,
        columnNumber: 5
    }, this);
}
_s1(EventPopup, "Kv6l9wVcTVoYtGD3Mw7BY/nouxI=");
_c1 = EventPopup;
const CATEGORIES = [
    {
        value: "sightseeing",
        label: "Sightseeing",
        icon: "🏛️"
    },
    {
        value: "food",
        label: "Food & Dining",
        icon: "🍽️"
    },
    {
        value: "outdoors",
        label: "Outdoors",
        icon: "🌲"
    },
    {
        value: "transport",
        label: "Transport",
        icon: "🚌"
    },
    {
        value: "shopping",
        label: "Shopping",
        icon: "🛍️"
    },
    {
        value: "nightlife",
        label: "Nightlife",
        icon: "🌙"
    },
    {
        value: "wellness",
        label: "Wellness",
        icon: "🧘"
    },
    {
        value: "task",
        label: "Task / Errand",
        icon: "📋"
    },
    {
        value: "other",
        label: "Other",
        icon: "📌"
    }
];
function getCategoryInfo(value) {
    return CATEGORIES.find((c)=>c.value === value) || {
        value: "other",
        label: "Other",
        icon: "📌"
    };
}
function DayPopout({ dateKey, tripId, tripStart, dayData, activities, inRange, onClose, onUpdate, calendarEvents, activeItineraryId }) {
    _s2();
    const [title, setTitle] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(dayData?.title || "");
    const [editingTitle, setEditingTitle] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [notes, setNotes] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(dayData?.notes || "");
    const [editingNotes, setEditingNotes] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [addingEvent, setAddingEvent] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [saving, setSaving] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [dragIndex, setDragIndex] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const dayOfWeek = new Date(dateKey + "T00:00:00").toLocaleDateString("en-US", {
        weekday: "long"
    });
    const dateFormatted = new Date(dateKey + "T00:00:00").toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric"
    });
    // Compute day count relative to trip start
    let dayNumber = null;
    if (tripStart && inRange) {
        const start = new Date(tripStart + "T00:00:00");
        const current = new Date(dateKey + "T00:00:00");
        dayNumber = Math.round((current - start) / (1000 * 60 * 60 * 24)) + 1;
    }
    async function handleSaveTitle() {
        setEditingTitle(false);
        if (dayData) {
            await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from("days").update({
                title: title || null
            }).eq("id", dayData.id);
        } else if (title.trim()) {
            await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from("days").insert({
                trip_id: tripId,
                date: dateKey,
                title: title || null,
                notes: notes || null,
                itinerary_id: activeItineraryId || null
            });
        }
        onUpdate();
    }
    async function handleSaveNotes() {
        setEditingNotes(false);
        if (dayData) {
            await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from("days").update({
                notes: notes || null
            }).eq("id", dayData.id);
        } else if (notes.trim()) {
            await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from("days").insert({
                trip_id: tripId,
                date: dateKey,
                title: title || null,
                notes: notes || null,
                itinerary_id: activeItineraryId || null
            });
        }
        onUpdate();
    }
    async function ensureDayExists() {
        if (dayData?.id) return dayData.id;
        const { data } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from("days").insert({
            trip_id: tripId,
            date: dateKey,
            title: title || null,
            notes: notes || null,
            itinerary_id: activeItineraryId || null
        }).select().single();
        return data.id;
    }
    async function saveNewEvent(data) {
        if (!data || !data.title.trim()) {
            setAddingEvent(false);
            return;
        }
        const dayId = await ensureDayExists();
        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from("activities").insert({
            day_id: dayId,
            title: data.title.trim(),
            start_time: data.start_time || null,
            end_time: data.end_time || null,
            location: data.location || null,
            category: "other",
            notes: data.notes || null,
            sort_order: activities.length
        });
        setAddingEvent(false);
        onUpdate();
    }
    async function handleUpdateActivity(activityId, updates) {
        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from("activities").update(updates).eq("id", activityId);
        onUpdate();
    }
    async function handleToggleActivity(activityId, currentChecked) {
        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from("activities").update({
            is_checked: !currentChecked
        }).eq("id", activityId);
        onUpdate();
    }
    async function handleDeleteActivity(activityId) {
        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from("activities").delete().eq("id", activityId);
        onUpdate();
    }
    async function handleOptionTimeChange(table, recordId, timeField, newTime, endTimeField, newEndTime) {
        const updates = {
            [timeField]: newTime || null
        };
        if (endTimeField) updates[endTimeField] = newEndTime || null;
        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from(table).update(updates).eq("id", recordId);
        onUpdate();
    }
    // Sort user activities: untimed first (by sort_order), then timed chronologically
    const sortedActivities = [
        ...activities
    ].sort((a, b)=>{
        const aTime = a.start_time || null;
        const bTime = b.start_time || null;
        if (aTime && bTime) return aTime.localeCompare(bTime);
        if (!aTime && !bTime) return (a.sort_order || 0) - (b.sort_order || 0);
        if (!aTime) return -1; // untimed first
        return 1;
    });
    async function handleUntimedReorder(fromIdx, toIdx, items) {
        if (fromIdx === toIdx) return;
        const reordered = [
            ...items
        ];
        const [moved] = reordered.splice(fromIdx, 1);
        reordered.splice(toIdx, 0, moved);
        const newOrder = reordered.map((item)=>item.sortKey);
        // Save the order to the day record
        const dayId = await ensureDayExists();
        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from("days").update({
            untimed_order: newOrder
        }).eq("id", dayId);
        onUpdate();
    }
    // Build itinerary events list from calendarEvents prop
    const itineraryEvents = [];
    const accommodationEvents = [];
    const colorMap = {
        flight: {
            bg: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$categoryColors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].flight.bg,
            border: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$categoryColors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].flight.border,
            text: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$categoryColors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].flight.text,
            dot: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$categoryColors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].flight.dot
        },
        activity: {
            bg: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$categoryColors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].activity.bg,
            border: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$categoryColors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].activity.border,
            text: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$categoryColors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].activity.text,
            dot: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$categoryColors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].activity.dot
        },
        dining: {
            bg: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$categoryColors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].dining.bg,
            border: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$categoryColors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].dining.border,
            text: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$categoryColors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].dining.text,
            dot: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$categoryColors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].dining.dot
        },
        transportation: {
            bg: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$categoryColors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].transportation.bg,
            border: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$categoryColors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].transportation.border,
            text: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$categoryColors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].transportation.text,
            dot: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$categoryColors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].transportation.dot
        },
        accommodation: {
            bg: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$categoryColors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].accommodation.bg,
            border: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$categoryColors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].accommodation.border,
            text: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$categoryColors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].accommodation.text,
            dot: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$categoryColors$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].accommodation.dot
        }
    };
    if (calendarEvents) {
        (calendarEvents.flights || []).forEach((f)=>itineraryEvents.push({
                type: "flight",
                time: f.departure_time?.slice(0, 5),
                endTime: f.arrival_time?.slice(0, 5),
                name: `${f.departure_airport} → ${f.arrival_airport}`,
                detail: f.airline_name || "",
                _record: f,
                _table: "flights",
                _timeField: "departure_time",
                _endTimeField: "arrival_time"
            }));
        (calendarEvents.activities || []).forEach((a)=>itineraryEvents.push({
                type: "activity",
                time: a.start_time?.slice(0, 5),
                endTime: a.end_time?.slice(0, 5),
                name: a.name,
                detail: a.location || "",
                _record: a,
                _table: "activity_options",
                _timeField: "start_time",
                _endTimeField: "end_time"
            }));
        (calendarEvents.dining || []).forEach((d)=>itineraryEvents.push({
                type: "dining",
                time: d.start_time?.slice(0, 5),
                endTime: d.end_time?.slice(0, 5),
                name: d.name,
                detail: d.location || "",
                _record: d,
                _table: "dining_options",
                _timeField: "start_time",
                _endTimeField: "end_time"
            }));
        (calendarEvents.transport || []).forEach((t)=>itineraryEvents.push({
                type: "transportation",
                time: t.departure_time?.slice(0, 5),
                endTime: t.arrival_time?.slice(0, 5),
                name: t.name,
                detail: "",
                _record: t,
                _table: "transportation_options",
                _timeField: "departure_time",
                _endTimeField: "arrival_time"
            }));
        (calendarEvents.accommodations || []).forEach((a)=>accommodationEvents.push({
                type: "accommodation",
                time: null,
                name: a.name,
                detail: a.location || ""
            }));
    }
    // Build unified event list: option events + user events, sorted together
    const allDayEvents = [];
    itineraryEvents.forEach((evt, i)=>{
        const stableKey = evt._record?.id ? `${evt.type}-${evt._record.id}` : `itin-${i}`;
        allDayEvents.push({
            kind: "option",
            ...evt,
            sortTime: evt.time || null,
            sortKey: stableKey
        });
    });
    sortedActivities.forEach((a)=>{
        allDayEvents.push({
            kind: "user",
            activity: a,
            sortTime: a.start_time?.slice(0, 5) || null,
            sortKey: `user-${a.id}`
        });
    });
    // Sort all events: use saved order if available, otherwise untimed first (by insertion), then timed chronologically
    const savedOrder = dayData?.untimed_order;
    let allDayEventsSorted;
    if (savedOrder && Array.isArray(savedOrder) && savedOrder.length > 0) {
        // Use saved order for any events present in it; append unseen events at end
        const ordered = [];
        const remaining = [
            ...allDayEvents
        ];
        for (const key of savedOrder){
            const idx = remaining.findIndex((e)=>e.sortKey === key);
            if (idx !== -1) {
                ordered.push(remaining.splice(idx, 1)[0]);
            }
        }
        // Append any events not in the saved order: untimed first, then timed chronologically
        const unseenUntimed = remaining.filter((e)=>!e.sortTime);
        const unseenTimed = remaining.filter((e)=>e.sortTime).sort((a, b)=>a.sortTime.localeCompare(b.sortTime));
        allDayEventsSorted = [
            ...ordered,
            ...unseenUntimed,
            ...unseenTimed
        ];
    } else {
        // Default: untimed first, then timed chronologically
        const untimedEvents = allDayEvents.filter((e)=>!e.sortTime);
        const timedEvents = allDayEvents.filter((e)=>e.sortTime).sort((a, b)=>a.sortTime.localeCompare(b.sortTime));
        allDayEventsSorted = [
            ...untimedEvents,
            ...timedEvents
        ];
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4",
        onClick: onClose,
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "bg-white rounded-2xl shadow-xl border border-stone-200 w-full max-w-md max-h-[85vh] overflow-y-auto relative",
            onClick: (e)=>e.stopPropagation(),
            style: {
                animation: "cardFadeIn 0.2s ease-out"
            },
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "px-5 pt-5 pb-3 border-b border-stone-200/60 rounded-t-2xl sticky top-0 z-10",
                    style: {
                        background: "rgba(222,210,190,0.5)"
                    },
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: onClose,
                            className: "absolute top-2 right-3 text-stone-400 hover:text-stone-600 transition-colors p-1",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                className: "w-5 h-5",
                                fill: "none",
                                stroke: "currentColor",
                                viewBox: "0 0 24 24",
                                strokeWidth: 2,
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                    strokeLinecap: "round",
                                    strokeLinejoin: "round",
                                    d: "M6 18L18 6M6 6l12 12"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/trips/[id]/page.js",
                                    lineNumber: 2054,
                                    columnNumber: 108
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/app/trips/[id]/page.js",
                                lineNumber: 2054,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/app/trips/[id]/page.js",
                            lineNumber: 2053,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center gap-2.5",
                            children: [
                                dayNumber && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "text-2xl font-bold text-[#da7b4a] whitespace-nowrap leading-none",
                                    children: [
                                        "DAY ",
                                        dayNumber
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/trips/[id]/page.js",
                                    lineNumber: 2060,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "text-[11px] font-semibold text-stone-500 uppercase tracking-wide leading-tight",
                                            children: dayOfWeek
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/trips/[id]/page.js",
                                            lineNumber: 2063,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "text-[11px] text-stone-400 leading-tight",
                                            children: dateFormatted
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/trips/[id]/page.js",
                                            lineNumber: 2064,
                                            columnNumber: 15
                                        }, this),
                                        !inRange && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-[10px] text-amber-600 font-medium",
                                            children: "Outside trip dates"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/trips/[id]/page.js",
                                            lineNumber: 2066,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/trips/[id]/page.js",
                                    lineNumber: 2062,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/trips/[id]/page.js",
                            lineNumber: 2058,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "mt-1.5 flex items-center min-h-[32px]",
                            children: editingTitle ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                type: "text",
                                value: title,
                                onChange: (e)=>setTitle(e.target.value),
                                onBlur: handleSaveTitle,
                                onKeyDown: (e)=>{
                                    if (e.key === "Enter") handleSaveTitle();
                                    if (e.key === "Escape") setEditingTitle(false);
                                },
                                autoFocus: true,
                                placeholder: "Add a title for this day...",
                                className: "w-full text-2xl font-bold text-stone-800 bg-white border border-stone-300 rounded-lg px-2 py-0.5 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#da7b4a]/50 focus:border-transparent"
                            }, void 0, false, {
                                fileName: "[project]/src/app/trips/[id]/page.js",
                                lineNumber: 2074,
                                columnNumber: 15
                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                onClick: ()=>setEditingTitle(true),
                                className: `w-full text-2xl font-bold cursor-text py-0.5 rounded-lg transition-colors border border-transparent ${title ? "text-stone-700 hover:text-[#da7b4a]" : "text-stone-400 hover:text-[#da7b4a] italic text-base"}`,
                                title: "Click to edit day title",
                                children: title ? title.toUpperCase() : "Add a title for this day..."
                            }, void 0, false, {
                                fileName: "[project]/src/app/trips/[id]/page.js",
                                lineNumber: 2085,
                                columnNumber: 15
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/app/trips/[id]/page.js",
                            lineNumber: 2072,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/trips/[id]/page.js",
                    lineNumber: 2051,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "px-6 py-4 space-y-4",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-center gap-1.5 mb-2",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                            className: "w-3.5 h-3.5 text-stone-400",
                                            fill: "none",
                                            stroke: "currentColor",
                                            viewBox: "0 0 24 24",
                                            strokeWidth: 2,
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                strokeLinecap: "round",
                                                strokeLinejoin: "round",
                                                d: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/trips/[id]/page.js",
                                                lineNumber: 2103,
                                                columnNumber: 129
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/trips/[id]/page.js",
                                            lineNumber: 2103,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-xs font-medium text-stone-400 uppercase tracking-wide",
                                            children: "Day Itinerary"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/trips/[id]/page.js",
                                            lineNumber: 2104,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/trips/[id]/page.js",
                                    lineNumber: 2102,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "space-y-1.5",
                                    children: [
                                        allDayEventsSorted.map((item, eventIdx)=>{
                                            const dragProps = {
                                                draggable: true,
                                                onDragStart: (e)=>{
                                                    e.dataTransfer.effectAllowed = "move";
                                                    setDragIndex(eventIdx);
                                                },
                                                onDragOver: (e)=>{
                                                    e.preventDefault();
                                                    e.dataTransfer.dropEffect = "move";
                                                },
                                                onDrop: (e)=>{
                                                    e.preventDefault();
                                                    handleUntimedReorder(dragIndex, eventIdx, allDayEventsSorted);
                                                    setDragIndex(null);
                                                },
                                                onDragEnd: ()=>setDragIndex(null)
                                            };
                                            if (item.kind === "option") {
                                                const c = colorMap[item.type] || colorMap.activity;
                                                const canEditTime = item.type !== "flight" && item._record && item._table && item._timeField;
                                                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    ...dragProps,
                                                    className: `cursor-grab active:cursor-grabbing ${dragIndex === eventIdx ? "opacity-50" : ""}`,
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(OptionEventCard, {
                                                        item: item,
                                                        colors: c,
                                                        canEditTime: canEditTime,
                                                        onTimeChange: canEditTime ? (newTime, newEndTime)=>handleOptionTimeChange(item._table, item._record.id, item._timeField, newTime, item._endTimeField, newEndTime) : undefined,
                                                        isDraggable: true
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/trips/[id]/page.js",
                                                        lineNumber: 2125,
                                                        columnNumber: 23
                                                    }, this)
                                                }, item.sortKey, false, {
                                                    fileName: "[project]/src/app/trips/[id]/page.js",
                                                    lineNumber: 2122,
                                                    columnNumber: 21
                                                }, this);
                                            } else {
                                                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    ...dragProps,
                                                    className: `cursor-grab active:cursor-grabbing ${dragIndex === eventIdx ? "opacity-50" : ""}`,
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(UserEventCard, {
                                                        activity: item.activity,
                                                        onUpdate: (updates)=>handleUpdateActivity(item.activity.id, updates),
                                                        onDelete: ()=>handleDeleteActivity(item.activity.id),
                                                        isDraggable: true
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/trips/[id]/page.js",
                                                        lineNumber: 2139,
                                                        columnNumber: 23
                                                    }, this)
                                                }, item.sortKey, false, {
                                                    fileName: "[project]/src/app/trips/[id]/page.js",
                                                    lineNumber: 2136,
                                                    columnNumber: 21
                                                }, this);
                                            }
                                        }),
                                        addingEvent && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(NewEventCard, {
                                            onSave: (data)=>saveNewEvent(data),
                                            onCancel: ()=>setAddingEvent(false)
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/trips/[id]/page.js",
                                            lineNumber: 2152,
                                            columnNumber: 17
                                        }, this),
                                        allDayEventsSorted.length === 0 && !addingEvent && accommodationEvents.length === 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-sm text-stone-400 italic",
                                            children: "No events yet"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/trips/[id]/page.js",
                                            lineNumber: 2159,
                                            columnNumber: 17
                                        }, this),
                                        !addingEvent && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: ()=>setAddingEvent(true),
                                            className: "w-full border-2 border-dashed border-stone-300 text-stone-400 text-sm font-medium rounded-lg py-2.5 hover:border-[#da7b4a]/50 hover:text-[#da7b4a] transition-colors",
                                            children: "+ Add Event"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/trips/[id]/page.js",
                                            lineNumber: 2164,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/trips/[id]/page.js",
                                    lineNumber: 2108,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/trips/[id]/page.js",
                            lineNumber: 2101,
                            columnNumber: 11
                        }, this),
                        accommodationEvents.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-center gap-1.5 mb-2",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                            xmlns: "http://www.w3.org/2000/svg",
                                            viewBox: "0 0 20 20",
                                            fill: "currentColor",
                                            className: "w-3.5 h-3.5 text-stone-400",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                d: "M.75 15.5a.75.75 0 0 0 1.5 0V13h16v2.5a.75.75 0 0 0 1.5 0v-6a.75.75 0 0 0-1.5 0V11H16V4.5A2.5 2.5 0 0 0 13.5 2h-7A2.5 2.5 0 0 0 4 4.5V11H2.25V9.5a.75.75 0 0 0-1.5 0v6ZM5.5 4.5a1 1 0 0 1 1-1h7a1 1 0 0 1 1 1V11h-9V4.5Z"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/trips/[id]/page.js",
                                                lineNumber: 2179,
                                                columnNumber: 19
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/trips/[id]/page.js",
                                            lineNumber: 2178,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-xs font-medium text-stone-400 uppercase tracking-wide",
                                            children: "Accommodations"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/trips/[id]/page.js",
                                            lineNumber: 2181,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/trips/[id]/page.js",
                                    lineNumber: 2177,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "space-y-1.5",
                                    children: accommodationEvents.map((evt, i)=>{
                                        const c = colorMap.accommodation;
                                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: `flex items-center gap-2.5 ${c.bg} border ${c.border} rounded-lg px-3 py-2`,
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: `w-2 h-2 rounded-full ${c.dot} flex-shrink-0`
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/trips/[id]/page.js",
                                                    lineNumber: 2188,
                                                    columnNumber: 23
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex-1 min-w-0",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: `text-sm font-medium ${c.text}`,
                                                            children: evt.name
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/trips/[id]/page.js",
                                                            lineNumber: 2190,
                                                            columnNumber: 25
                                                        }, this),
                                                        evt.detail && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "text-xs text-stone-400 ml-2",
                                                            children: evt.detail
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/trips/[id]/page.js",
                                                            lineNumber: 2191,
                                                            columnNumber: 40
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/trips/[id]/page.js",
                                                    lineNumber: 2189,
                                                    columnNumber: 23
                                                }, this)
                                            ]
                                        }, `accom-${i}`, true, {
                                            fileName: "[project]/src/app/trips/[id]/page.js",
                                            lineNumber: 2187,
                                            columnNumber: 21
                                        }, this);
                                    })
                                }, void 0, false, {
                                    fileName: "[project]/src/app/trips/[id]/page.js",
                                    lineNumber: 2183,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/trips/[id]/page.js",
                            lineNumber: 2176,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "pt-2 border-t border-stone-100",
                            children: editingNotes ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                                value: notes,
                                onChange: (e)=>setNotes(e.target.value),
                                onBlur: handleSaveNotes,
                                onKeyDown: (e)=>{
                                    if (e.key === "Escape") {
                                        setEditingNotes(false);
                                        setNotes(dayData?.notes || "");
                                    }
                                },
                                autoFocus: true,
                                rows: 3,
                                placeholder: "Add notes for this day...",
                                className: "w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#da7b4a]/50 focus:border-transparent text-sm text-stone-700 bg-white resize-none"
                            }, void 0, false, {
                                fileName: "[project]/src/app/trips/[id]/page.js",
                                lineNumber: 2203,
                                columnNumber: 15
                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                onClick: ()=>setEditingNotes(true),
                                className: `text-sm px-3 py-2 rounded-lg cursor-text transition-colors min-h-[40px] border border-stone-300 ${notes ? "text-stone-600 hover:text-[#da7b4a]" : "text-stone-400 hover:text-[#da7b4a] italic"}`,
                                title: "Click to edit notes",
                                children: notes || "Add notes for this day..."
                            }, void 0, false, {
                                fileName: "[project]/src/app/trips/[id]/page.js",
                                lineNumber: 2214,
                                columnNumber: 15
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/app/trips/[id]/page.js",
                            lineNumber: 2201,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/trips/[id]/page.js",
                    lineNumber: 2098,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/app/trips/[id]/page.js",
            lineNumber: 2045,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/app/trips/[id]/page.js",
        lineNumber: 2044,
        columnNumber: 5
    }, this);
}
_s2(DayPopout, "WCCQK3NMSF3knYyc2De4Xh0iK4Y=");
_c2 = DayPopout;
// Format 24h time "HH:MM" to "h:mm AM/PM"
/* ── OptionEventCard: option-module event with editable time ── */ function OptionEventCard({ item, colors: c, canEditTime, onTimeChange, isDraggable }) {
    _s3();
    const [showPopup, setShowPopup] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const isTransport = item.type === "transportation";
    const startLabel = isTransport ? "Depart" : "Start";
    const endLabel = isTransport ? "Arrive" : "End";
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: `flex items-start gap-2.5 ${c.bg} border ${c.border} rounded-lg px-3 py-2 group`,
        children: [
            isDraggable && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex-shrink-0 mt-1 text-stone-300 cursor-grab active:cursor-grabbing",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                    className: "w-3 h-3",
                    viewBox: "0 0 10 10",
                    fill: "currentColor",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
                            cx: "3",
                            cy: "2",
                            r: "1"
                        }, void 0, false, {
                            fileName: "[project]/src/app/trips/[id]/page.js",
                            lineNumber: 2244,
                            columnNumber: 76
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
                            cx: "7",
                            cy: "2",
                            r: "1"
                        }, void 0, false, {
                            fileName: "[project]/src/app/trips/[id]/page.js",
                            lineNumber: 2244,
                            columnNumber: 105
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
                            cx: "3",
                            cy: "5",
                            r: "1"
                        }, void 0, false, {
                            fileName: "[project]/src/app/trips/[id]/page.js",
                            lineNumber: 2244,
                            columnNumber: 134
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
                            cx: "7",
                            cy: "5",
                            r: "1"
                        }, void 0, false, {
                            fileName: "[project]/src/app/trips/[id]/page.js",
                            lineNumber: 2244,
                            columnNumber: 163
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
                            cx: "3",
                            cy: "8",
                            r: "1"
                        }, void 0, false, {
                            fileName: "[project]/src/app/trips/[id]/page.js",
                            lineNumber: 2244,
                            columnNumber: 192
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
                            cx: "7",
                            cy: "8",
                            r: "1"
                        }, void 0, false, {
                            fileName: "[project]/src/app/trips/[id]/page.js",
                            lineNumber: 2244,
                            columnNumber: 221
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/trips/[id]/page.js",
                    lineNumber: 2244,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/app/trips/[id]/page.js",
                lineNumber: 2243,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "relative flex-shrink-0 w-16 mt-0.5",
                children: canEditTime ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                    children: [
                        item.time ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            onClick: ()=>setShowPopup(true),
                            className: "text-xs text-stone-500 cursor-pointer hover:text-[#da7b4a] transition-colors",
                            title: "Click to edit time",
                            children: [
                                (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$TimeSelectPopup$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["formatTime12h"])(item.time),
                                item.endTime && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("br", {}, void 0, false, {
                                            fileName: "[project]/src/app/trips/[id]/page.js",
                                            lineNumber: 2258,
                                            columnNumber: 36
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-stone-400",
                                            children: [
                                                "– ",
                                                (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$TimeSelectPopup$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["formatTime12h"])(item.endTime)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/trips/[id]/page.js",
                                            lineNumber: 2258,
                                            columnNumber: 42
                                        }, this)
                                    ]
                                }, void 0, true)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/trips/[id]/page.js",
                            lineNumber: 2252,
                            columnNumber: 15
                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            onClick: ()=>setShowPopup(true),
                            className: "text-xs text-stone-400 cursor-pointer opacity-0 group-hover:opacity-100 hover:text-[#da7b4a] transition-all",
                            children: "+ time"
                        }, void 0, false, {
                            fileName: "[project]/src/app/trips/[id]/page.js",
                            lineNumber: 2261,
                            columnNumber: 15
                        }, this),
                        showPopup && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$TimeSelectPopup$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                            startTime: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$TimeSelectPopup$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["to12h"])(item.time),
                            endTime: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$TimeSelectPopup$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["to12h"])(item.endTime),
                            startLabel: startLabel,
                            endLabel: endLabel,
                            showEndTime: true,
                            useFixed: true,
                            onSave: (start24, end24)=>{
                                setShowPopup(false);
                                if (onTimeChange) onTimeChange(start24, end24);
                            },
                            onClear: ()=>{
                                setShowPopup(false);
                                if (onTimeChange) onTimeChange(null, null);
                            },
                            onClose: ()=>setShowPopup(false)
                        }, void 0, false, {
                            fileName: "[project]/src/app/trips/[id]/page.js",
                            lineNumber: 2269,
                            columnNumber: 15
                        }, this)
                    ]
                }, void 0, true) : item.time ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    className: "text-xs text-stone-500",
                    children: [
                        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$TimeSelectPopup$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["formatTime12h"])(item.time),
                        item.endTime && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("br", {}, void 0, false, {
                                    fileName: "[project]/src/app/trips/[id]/page.js",
                                    lineNumber: 2292,
                                    columnNumber: 34
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "text-stone-400",
                                    children: [
                                        "– ",
                                        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$TimeSelectPopup$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["formatTime12h"])(item.endTime)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/trips/[id]/page.js",
                                    lineNumber: 2292,
                                    columnNumber: 40
                                }, this)
                            ]
                        }, void 0, true)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/trips/[id]/page.js",
                    lineNumber: 2290,
                    columnNumber: 13
                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {}, void 0, false, {
                    fileName: "[project]/src/app/trips/[id]/page.js",
                    lineNumber: 2294,
                    columnNumber: 15
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/app/trips/[id]/page.js",
                lineNumber: 2248,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: `w-2 h-2 rounded-full ${c.dot} flex-shrink-0 mt-[5px]`
            }, void 0, false, {
                fileName: "[project]/src/app/trips/[id]/page.js",
                lineNumber: 2297,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex-1 min-w-0",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: `text-sm font-medium ${c.text} uppercase`,
                        children: item.name
                    }, void 0, false, {
                        fileName: "[project]/src/app/trips/[id]/page.js",
                        lineNumber: 2299,
                        columnNumber: 9
                    }, this),
                    item.detail && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-xs text-stone-400 ml-2 uppercase",
                        children: item.detail
                    }, void 0, false, {
                        fileName: "[project]/src/app/trips/[id]/page.js",
                        lineNumber: 2300,
                        columnNumber: 25
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/trips/[id]/page.js",
                lineNumber: 2298,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/trips/[id]/page.js",
        lineNumber: 2241,
        columnNumber: 5
    }, this);
}
_s3(OptionEventCard, "YxEq4CBtuWdF8IGTVx1DJqim++A=");
_c3 = OptionEventCard;
/* ── UserEventCard: each field editable in place, no layout shift ── */ function UserEventCard({ activity, onUpdate, onDelete, isDraggable }) {
    _s4();
    const [editingField, setEditingField] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [editValue, setEditValue] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [showTimePicker, setShowTimePicker] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [notesValue, setNotesValue] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(activity.notes || "");
    const [confirmDelete, setConfirmDelete] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "UserEventCard.useEffect": ()=>{
            setNotesValue(activity.notes || "");
        }
    }["UserEventCard.useEffect"], [
        activity.notes
    ]);
    function startEdit(field) {
        setEditingField(field);
        if (field === "title") setEditValue(activity.title);
        else if (field === "location") setEditValue(activity.location || "");
        else if (field === "notes") setNotesValue(activity.notes || "");
    }
    function saveField(field) {
        setEditingField(null);
        if (field === "title") {
            const val = editValue.trim();
            if (val && val !== activity.title) onUpdate({
                title: val
            });
        } else if (field === "location") {
            const val = editValue.trim();
            if (val !== (activity.location || "")) onUpdate({
                location: val || null
            });
        } else if (field === "notes") {
            const val = notesValue.trim();
            if (val !== (activity.notes || "")) onUpdate({
                notes: val || null
            });
        }
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "relative bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 group transition-colors",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex items-start gap-2.5",
            children: [
                isDraggable && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex-shrink-0 mt-1 text-stone-300 cursor-grab active:cursor-grabbing",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                        className: "w-3 h-3",
                        viewBox: "0 0 10 10",
                        fill: "currentColor",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
                                cx: "3",
                                cy: "2",
                                r: "1"
                            }, void 0, false, {
                                fileName: "[project]/src/app/trips/[id]/page.js",
                                lineNumber: 2342,
                                columnNumber: 78
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
                                cx: "7",
                                cy: "2",
                                r: "1"
                            }, void 0, false, {
                                fileName: "[project]/src/app/trips/[id]/page.js",
                                lineNumber: 2342,
                                columnNumber: 107
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
                                cx: "3",
                                cy: "5",
                                r: "1"
                            }, void 0, false, {
                                fileName: "[project]/src/app/trips/[id]/page.js",
                                lineNumber: 2342,
                                columnNumber: 136
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
                                cx: "7",
                                cy: "5",
                                r: "1"
                            }, void 0, false, {
                                fileName: "[project]/src/app/trips/[id]/page.js",
                                lineNumber: 2342,
                                columnNumber: 165
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
                                cx: "3",
                                cy: "8",
                                r: "1"
                            }, void 0, false, {
                                fileName: "[project]/src/app/trips/[id]/page.js",
                                lineNumber: 2342,
                                columnNumber: 194
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
                                cx: "7",
                                cy: "8",
                                r: "1"
                            }, void 0, false, {
                                fileName: "[project]/src/app/trips/[id]/page.js",
                                lineNumber: 2342,
                                columnNumber: 223
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/trips/[id]/page.js",
                        lineNumber: 2342,
                        columnNumber: 13
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/app/trips/[id]/page.js",
                    lineNumber: 2341,
                    columnNumber: 11
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "relative flex-shrink-0 w-16 mt-0.5",
                    children: [
                        activity.start_time ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            onClick: (e)=>{
                                e.stopPropagation();
                                setShowTimePicker(!showTimePicker);
                            },
                            className: "text-xs text-stone-500 cursor-pointer hover:text-[#da7b4a] transition-colors",
                            children: [
                                (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$TimeSelectPopup$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["formatTime12h"])(activity.start_time.slice(0, 5)),
                                activity.end_time && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("br", {}, void 0, false, {
                                            fileName: "[project]/src/app/trips/[id]/page.js",
                                            lineNumber: 2353,
                                            columnNumber: 39
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-stone-400",
                                            children: [
                                                "– ",
                                                (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$TimeSelectPopup$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["formatTime12h"])(activity.end_time.slice(0, 5))
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/trips/[id]/page.js",
                                            lineNumber: 2353,
                                            columnNumber: 45
                                        }, this)
                                    ]
                                }, void 0, true)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/trips/[id]/page.js",
                            lineNumber: 2348,
                            columnNumber: 13
                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            onClick: (e)=>{
                                e.stopPropagation();
                                setShowTimePicker(!showTimePicker);
                            },
                            className: "text-xs text-stone-300 cursor-pointer hover:text-[#da7b4a] italic transition-colors opacity-0 group-hover:opacity-100",
                            children: "+ time"
                        }, void 0, false, {
                            fileName: "[project]/src/app/trips/[id]/page.js",
                            lineNumber: 2356,
                            columnNumber: 13
                        }, this),
                        showTimePicker && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$TimeSelectPopup$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                            startTime: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$TimeSelectPopup$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["to12h"])(activity.start_time?.slice(0, 5)),
                            endTime: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$TimeSelectPopup$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["to12h"])(activity.end_time?.slice(0, 5)),
                            showEndTime: true,
                            useFixed: true,
                            onSave: (start24, end24)=>{
                                setShowTimePicker(false);
                                onUpdate({
                                    start_time: start24,
                                    end_time: end24
                                });
                            },
                            onClear: ()=>{
                                setShowTimePicker(false);
                                onUpdate({
                                    start_time: null,
                                    end_time: null
                                });
                            },
                            onClose: ()=>setShowTimePicker(false)
                        }, void 0, false, {
                            fileName: "[project]/src/app/trips/[id]/page.js",
                            lineNumber: 2364,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/trips/[id]/page.js",
                    lineNumber: 2346,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "w-2 h-2 rounded-full bg-stone-400 flex-shrink-0 mt-[5px]"
                }, void 0, false, {
                    fileName: "[project]/src/app/trips/[id]/page.js",
                    lineNumber: 2382,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex-1 min-w-0",
                    children: [
                        editingField === "title" ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                            type: "text",
                            value: editValue,
                            onChange: (e)=>setEditValue(e.target.value),
                            onBlur: ()=>saveField("title"),
                            onKeyDown: (e)=>{
                                if (e.key === "Enter") saveField("title");
                                if (e.key === "Escape") setEditingField(null);
                            },
                            autoFocus: true,
                            className: "w-full text-sm font-medium text-stone-800 bg-white border border-stone-300 rounded px-1 py-0.5 focus:outline-none focus:ring-1 focus:ring-[#da7b4a]/50 focus:border-transparent -ml-1"
                        }, void 0, false, {
                            fileName: "[project]/src/app/trips/[id]/page.js",
                            lineNumber: 2387,
                            columnNumber: 13
                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            onClick: ()=>startEdit("title"),
                            className: "text-sm font-medium text-stone-700 hover:text-[#da7b4a] cursor-text transition-colors uppercase",
                            children: activity.title
                        }, void 0, false, {
                            fileName: "[project]/src/app/trips/[id]/page.js",
                            lineNumber: 2395,
                            columnNumber: 13
                        }, this),
                        editingField === "location" ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                            type: "text",
                            value: editValue,
                            onChange: (e)=>setEditValue(e.target.value),
                            onBlur: ()=>saveField("location"),
                            onKeyDown: (e)=>{
                                if (e.key === "Enter") saveField("location");
                                if (e.key === "Escape") setEditingField(null);
                            },
                            autoFocus: true,
                            placeholder: "Location...",
                            className: "w-full text-xs text-stone-500 bg-white border border-stone-300 rounded px-1 py-0.5 mt-0.5 focus:outline-none focus:ring-1 focus:ring-[#da7b4a]/50 focus:border-transparent -ml-1"
                        }, void 0, false, {
                            fileName: "[project]/src/app/trips/[id]/page.js",
                            lineNumber: 2399,
                            columnNumber: 13
                        }, this) : activity.location ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            onClick: ()=>startEdit("location"),
                            className: "block text-xs text-stone-400 hover:text-[#da7b4a] cursor-text transition-colors",
                            children: activity.location
                        }, void 0, false, {
                            fileName: "[project]/src/app/trips/[id]/page.js",
                            lineNumber: 2407,
                            columnNumber: 13
                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            onClick: ()=>startEdit("location"),
                            className: "block text-xs text-stone-300 hover:text-[#da7b4a] cursor-text italic transition-colors opacity-0 group-hover:opacity-100",
                            children: "+ location"
                        }, void 0, false, {
                            fileName: "[project]/src/app/trips/[id]/page.js",
                            lineNumber: 2409,
                            columnNumber: 13
                        }, this),
                        editingField === "notes" ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                            value: notesValue,
                            onChange: (e)=>setNotesValue(e.target.value),
                            onBlur: ()=>saveField("notes"),
                            onKeyDown: (e)=>{
                                if (e.key === "Escape") setEditingField(null);
                            },
                            autoFocus: true,
                            placeholder: "Add notes...",
                            rows: 2,
                            className: "w-full text-xs text-stone-500 bg-white border border-stone-300 rounded px-1 py-0.5 mt-0.5 focus:outline-none focus:ring-1 focus:ring-[#da7b4a]/50 focus:border-transparent -ml-1 resize-none"
                        }, void 0, false, {
                            fileName: "[project]/src/app/trips/[id]/page.js",
                            lineNumber: 2413,
                            columnNumber: 13
                        }, this) : activity.notes ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            onClick: ()=>startEdit("notes"),
                            className: "block text-xs text-stone-400 hover:text-[#da7b4a] cursor-text transition-colors mt-0.5",
                            children: activity.notes
                        }, void 0, false, {
                            fileName: "[project]/src/app/trips/[id]/page.js",
                            lineNumber: 2421,
                            columnNumber: 13
                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            onClick: ()=>startEdit("notes"),
                            className: "block text-xs text-stone-300 hover:text-[#da7b4a] cursor-text italic transition-colors opacity-0 group-hover:opacity-100",
                            children: "+ notes"
                        }, void 0, false, {
                            fileName: "[project]/src/app/trips/[id]/page.js",
                            lineNumber: 2423,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/trips/[id]/page.js",
                    lineNumber: 2385,
                    columnNumber: 9
                }, this),
                !confirmDelete ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                    onClick: (e)=>{
                        e.stopPropagation();
                        setConfirmDelete(true);
                    },
                    className: "text-stone-300 hover:text-red-500 p-1 transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0",
                    title: "Delete event",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                        className: "w-3.5 h-3.5",
                        fill: "none",
                        stroke: "currentColor",
                        viewBox: "0 0 24 24",
                        strokeWidth: 2,
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                            strokeLinecap: "round",
                            strokeLinejoin: "round",
                            d: "M6 18L18 6M6 6l12 12"
                        }, void 0, false, {
                            fileName: "[project]/src/app/trips/[id]/page.js",
                            lineNumber: 2429,
                            columnNumber: 112
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/app/trips/[id]/page.js",
                        lineNumber: 2429,
                        columnNumber: 13
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/app/trips/[id]/page.js",
                    lineNumber: 2428,
                    columnNumber: 11
                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex items-center gap-1 flex-shrink-0",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: onDelete,
                            className: "px-1.5 py-0.5 text-[10px] font-semibold text-white bg-red-500 rounded hover:bg-red-600 transition-colors",
                            children: "Delete"
                        }, void 0, false, {
                            fileName: "[project]/src/app/trips/[id]/page.js",
                            lineNumber: 2433,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: ()=>setConfirmDelete(false),
                            className: "px-1.5 py-0.5 text-[10px] text-stone-500 hover:text-stone-700 transition-colors",
                            children: "Cancel"
                        }, void 0, false, {
                            fileName: "[project]/src/app/trips/[id]/page.js",
                            lineNumber: 2434,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/trips/[id]/page.js",
                    lineNumber: 2432,
                    columnNumber: 11
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/app/trips/[id]/page.js",
            lineNumber: 2339,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/app/trips/[id]/page.js",
        lineNumber: 2338,
        columnNumber: 5
    }, this);
}
_s4(UserEventCard, "ZWmclRHQUPnihNlfkh1Vw/WuwA8=");
_c4 = UserEventCard;
/* ── NewEventCard: blank event row for adding, same layout as UserEventCard ── */ function NewEventCard({ onSave, onCancel }) {
    _s5();
    const [title, setTitle] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [location, setLocation] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [showTimePicker, setShowTimePicker] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [savedStart, setSavedStart] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [savedEnd, setSavedEnd] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [notes, setNotes] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const cardRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    function doSave() {
        onSave({
            title: title.trim(),
            start_time: savedStart,
            end_time: savedEnd,
            location: location || null,
            notes: notes || null
        });
    }
    function handleBlur() {
        setTimeout(()=>{
            if (cardRef.current && !cardRef.current.contains(document.activeElement)) {
                doSave();
            }
        }, 100);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        ref: cardRef,
        tabIndex: -1,
        onBlur: handleBlur,
        className: "relative bg-white border-2 border-dashed border-[#da7b4a]/40 rounded-lg px-3 py-2",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex items-start gap-2.5",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "relative flex-shrink-0 w-16 mt-0.5",
                    children: [
                        savedStart ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            onClick: (e)=>{
                                e.stopPropagation();
                                setShowTimePicker(!showTimePicker);
                            },
                            className: "text-xs text-stone-500 cursor-pointer hover:text-[#da7b4a] transition-colors",
                            children: [
                                (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$TimeSelectPopup$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["formatTime12h"])(savedStart),
                                savedEnd && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("br", {}, void 0, false, {
                                            fileName: "[project]/src/app/trips/[id]/page.js",
                                            lineNumber: 2482,
                                            columnNumber: 30
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-stone-400",
                                            children: [
                                                "– ",
                                                (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$TimeSelectPopup$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["formatTime12h"])(savedEnd)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/trips/[id]/page.js",
                                            lineNumber: 2482,
                                            columnNumber: 36
                                        }, this)
                                    ]
                                }, void 0, true)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/trips/[id]/page.js",
                            lineNumber: 2477,
                            columnNumber: 13
                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            onClick: (e)=>{
                                e.stopPropagation();
                                setShowTimePicker(!showTimePicker);
                            },
                            className: "text-xs text-stone-300 cursor-pointer hover:text-[#da7b4a] italic transition-colors",
                            children: "+ time"
                        }, void 0, false, {
                            fileName: "[project]/src/app/trips/[id]/page.js",
                            lineNumber: 2485,
                            columnNumber: 13
                        }, this),
                        showTimePicker && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$TimeSelectPopup$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                            startTime: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$TimeSelectPopup$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["to12h"])(savedStart),
                            endTime: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$TimeSelectPopup$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["to12h"])(savedEnd),
                            showEndTime: true,
                            useFixed: true,
                            onSave: (s, e)=>{
                                setShowTimePicker(false);
                                setSavedStart(s);
                                setSavedEnd(e);
                            },
                            onClear: ()=>{
                                setShowTimePicker(false);
                                setSavedStart(null);
                                setSavedEnd(null);
                            },
                            onClose: ()=>setShowTimePicker(false)
                        }, void 0, false, {
                            fileName: "[project]/src/app/trips/[id]/page.js",
                            lineNumber: 2493,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/trips/[id]/page.js",
                    lineNumber: 2475,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "w-2 h-2 rounded-full bg-stone-300 flex-shrink-0 mt-[5px]"
                }, void 0, false, {
                    fileName: "[project]/src/app/trips/[id]/page.js",
                    lineNumber: 2505,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex-1 min-w-0",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                            type: "text",
                            value: title,
                            onChange: (e)=>setTitle(e.target.value),
                            placeholder: "Event name...",
                            autoFocus: true,
                            onKeyDown: (e)=>{
                                if (e.key === "Escape") onCancel();
                                if (e.key === "Enter") doSave();
                            },
                            className: "w-full text-sm font-medium text-stone-800 bg-transparent border-none outline-none placeholder:text-stone-400 px-0"
                        }, void 0, false, {
                            fileName: "[project]/src/app/trips/[id]/page.js",
                            lineNumber: 2508,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                            type: "text",
                            value: location,
                            onChange: (e)=>setLocation(e.target.value),
                            placeholder: "Location...",
                            onKeyDown: (e)=>{
                                if (e.key === "Escape") onCancel();
                                if (e.key === "Enter") doSave();
                            },
                            className: "w-full text-xs text-stone-500 bg-transparent border-none outline-none placeholder:text-stone-300 px-0"
                        }, void 0, false, {
                            fileName: "[project]/src/app/trips/[id]/page.js",
                            lineNumber: 2514,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                            type: "text",
                            value: notes,
                            onChange: (e)=>setNotes(e.target.value),
                            placeholder: "Notes...",
                            onKeyDown: (e)=>{
                                if (e.key === "Escape") onCancel();
                                if (e.key === "Enter") doSave();
                            },
                            className: "w-full text-xs text-stone-500 bg-transparent border-none outline-none placeholder:text-stone-300 px-0"
                        }, void 0, false, {
                            fileName: "[project]/src/app/trips/[id]/page.js",
                            lineNumber: 2520,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/trips/[id]/page.js",
                    lineNumber: 2507,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/app/trips/[id]/page.js",
            lineNumber: 2474,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/app/trips/[id]/page.js",
        lineNumber: 2471,
        columnNumber: 5
    }, this);
}
_s5(NewEventCard, "XkMY+HT7AVIBakAdqXCZy17ykoI=");
_c5 = NewEventCard;
var _c, _c1, _c2, _c3, _c4, _c5;
__turbopack_context__.k.register(_c, "TripDetailPage");
__turbopack_context__.k.register(_c1, "EventPopup");
__turbopack_context__.k.register(_c2, "DayPopout");
__turbopack_context__.k.register(_c3, "OptionEventCard");
__turbopack_context__.k.register(_c4, "UserEventCard");
__turbopack_context__.k.register(_c5, "NewEventCard");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=src_app_trips_%5Bid%5D_page_0~a.cyv.js.map