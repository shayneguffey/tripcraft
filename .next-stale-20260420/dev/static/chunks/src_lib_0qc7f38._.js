(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/src/lib/supabase.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "supabase",
    ()=>supabase
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@supabase/supabase-js/dist/index.mjs [app-client] (ecmascript) <locals>");
;
const supabaseUrl = ("TURBOPACK compile-time value", "https://wywwksawbdjyjnccsqte.supabase.co");
const supabaseAnonKey = ("TURBOPACK compile-time value", "sb_publishable_FSx9dx4huo4VLWMeUVk7hw_CuCy5pOJ");
const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createClient"])(supabaseUrl, supabaseAnonKey);
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/flightParser.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getAirlineName",
    ()=>getAirlineName,
    "getCityName",
    ()=>getCityName,
    "parseFlightInput",
    ()=>parseFlightInput,
    "parseFlightText",
    ()=>parseFlightText,
    "parseOcrText",
    ()=>parseOcrText
]);
// Flight URL and text parsers for Google Flights, Skyscanner, Delta, and raw text
const AIRPORT_CITIES = {
    LAX: "Los Angeles",
    ICN: "Seoul-Incheon",
    NRT: "Tokyo-Narita",
    HND: "Tokyo-Haneda",
    TYO: "Tokyo",
    BKK: "Bangkok",
    SFO: "San Francisco",
    SEA: "Seattle",
    JFK: "New York",
    ORD: "Chicago",
    ATL: "Atlanta",
    DFW: "Dallas",
    DEN: "Denver",
    SLC: "Salt Lake City",
    PDX: "Portland",
    PHX: "Phoenix",
    LAS: "Las Vegas",
    SAN: "San Diego",
    IAH: "Houston",
    MIA: "Miami",
    BOS: "Boston",
    EWR: "Newark",
    IAD: "Washington DC",
    CLT: "Charlotte",
    MSP: "Minneapolis",
    DTW: "Detroit",
    PHL: "Philadelphia",
    MCO: "Orlando",
    TPA: "Tampa",
    LHR: "London",
    CDG: "Paris",
    FRA: "Frankfurt",
    AMS: "Amsterdam",
    FCO: "Rome",
    BCN: "Barcelona",
    MAD: "Madrid",
    IST: "Istanbul",
    DXB: "Dubai",
    SIN: "Singapore",
    HKG: "Hong Kong",
    TPE: "Taipei",
    PEK: "Beijing",
    PVG: "Shanghai",
    KIX: "Osaka",
    CTS: "Sapporo",
    CNX: "Chiang Mai",
    HNL: "Honolulu",
    OGG: "Maui",
    GUM: "Guam",
    SYD: "Sydney",
    MEL: "Melbourne",
    AKL: "Auckland",
    YVR: "Vancouver",
    YYZ: "Toronto",
    MEX: "Mexico City",
    CUN: "Cancun",
    LIM: "Lima",
    GRU: "São Paulo",
    EZE: "Buenos Aires",
    BOG: "Bogotá",
    SCL: "Santiago",
    MNL: "Manila",
    SGN: "Ho Chi Minh",
    HAN: "Hanoi",
    KUL: "Kuala Lumpur",
    CGK: "Jakarta",
    DEL: "New Delhi",
    BOM: "Mumbai"
};
const AIRLINE_NAMES = {
    DL: "Delta",
    AA: "American",
    UA: "United",
    WN: "Southwest",
    AS: "Alaska",
    B6: "JetBlue",
    NK: "Spirit",
    F9: "Frontier",
    HA: "Hawaiian",
    KE: "Korean Air",
    OZ: "Asiana",
    NH: "ANA",
    JL: "JAL",
    CX: "Cathay Pacific",
    SQ: "Singapore Airlines",
    TG: "Thai Airways",
    BR: "EVA Air",
    CI: "China Airlines",
    MH: "Malaysia Airlines",
    QF: "Qantas",
    NZ: "Air New Zealand",
    AC: "Air Canada",
    BA: "British Airways",
    LH: "Lufthansa",
    AF: "Air France",
    KL: "KLM",
    IB: "Iberia",
    TK: "Turkish Airlines",
    EK: "Emirates",
    QR: "Qatar Airways",
    EY: "Etihad",
    CZ: "China Southern",
    CA: "Air China",
    MU: "China Eastern",
    PR: "Philippine Airlines",
    VN: "Vietnam Airlines"
};
function getCityName(code) {
    return AIRPORT_CITIES[code?.toUpperCase()] || code;
}
function getAirlineName(code) {
    return AIRLINE_NAMES[code?.toUpperCase()] || code;
}
function parseFlightInput(input) {
    if (!input || !input.trim()) return null;
    const trimmed = input.trim();
    // Check if it's a URL
    if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
        if (trimmed.includes("google.com/travel/flights")) {
            return {
                type: "google_flights",
                url: trimmed,
                legs: parseGoogleFlightsUrl(trimmed)
            };
        }
        if (trimmed.includes("skyscanner.com")) {
            return {
                type: "skyscanner",
                url: trimmed,
                legs: parseSkyscannerUrl(trimmed)
            };
        }
        if (trimmed.includes("delta.com")) {
            return {
                type: "delta",
                url: trimmed,
                legs: parseDeltaUrl(trimmed)
            };
        }
        if (trimmed.includes("united.com")) {
            return {
                type: "united",
                url: trimmed,
                legs: parseUnitedUrl(trimmed)
            };
        }
        // Generic URL — can't parse, but store it
        return {
            type: "unknown_url",
            url: trimmed,
            legs: []
        };
    }
    // Otherwise try to parse as text
    const legs = parseFlightText(trimmed);
    return {
        type: "text",
        legs
    };
}
// Parse Delta URL parameters
function parseDeltaUrl(url) {
    const legs = [];
    try {
        const u = new URL(url);
        const params = u.searchParams;
        // Delta encodes segments as: itinSegment[0]=0:X:LAX:ICN:DL:7834:OCT:02:2026:11P
        const numSegs = parseInt(params.get("numOfSegments") || "0");
        const price = params.get("price");
        const cabin = params.get("cabin") || "ECONOMY";
        const tripType = params.get("tripType");
        for(let i = 0; i < Math.max(numSegs, 4); i++){
            const seg = params.get(`itinSegment[${i}]`);
            if (!seg) continue;
            // Format: segNum:cabinCode:from:to:airline:flightNum:MONTH:day:year:time
            const parts = seg.split(":");
            if (parts.length < 10) continue;
            const cabinCode = parts[1];
            const from = parts[2];
            const to = parts[3];
            const airlineCode = parts[4];
            const flightNum = parts[5];
            const month = parts[6];
            const day = parts[7];
            const year = parts[8];
            const timeCode = parts[9]; // e.g., "11P" or "07P"
            // Parse the time code
            const depTime = parseTimeCode(timeCode);
            // Parse the date
            const monthNum = parseMonth(month);
            const dateStr = monthNum > 0 ? `${year}-${String(monthNum).padStart(2, "0")}-${String(day).padStart(2, "0")}` : null;
            legs.push({
                direction: i === 0 ? "outbound" : "return",
                airline_code: airlineCode,
                airline_name: getAirlineName(airlineCode),
                flight_number: `${airlineCode} ${flightNum}`,
                departure_airport: from,
                arrival_airport: to,
                departure_date: dateStr,
                departure_time: depTime,
                cabin_class: cabin.toLowerCase(),
                leg_order: i
            });
        }
        // Attach price metadata
        if (legs.length > 0 && price) {
            legs._price = parseFloat(price);
            legs._currency = params.get("currencyCd") || "USD";
        }
    } catch (e) {
        console.error("Delta URL parse error:", e);
    }
    return legs;
}
function parseTimeCode(code) {
    if (!code) return null;
    // "11P" → "23:00", "07P" → "19:00", "08A" → "08:00"
    const match = code.match(/^(\d{1,2})(A|P)$/i);
    if (!match) return null;
    let hour = parseInt(match[1]);
    const ampm = match[2].toUpperCase();
    if (ampm === "P" && hour !== 12) hour += 12;
    if (ampm === "A" && hour === 12) hour = 0;
    return `${String(hour).padStart(2, "0")}:00`;
}
function parseMonth(monthStr) {
    const months = {
        JAN: 1,
        FEB: 2,
        MAR: 3,
        APR: 4,
        MAY: 5,
        JUN: 6,
        JUL: 7,
        AUG: 8,
        SEP: 9,
        OCT: 10,
        NOV: 11,
        DEC: 12
    };
    return months[monthStr?.toUpperCase()] || 0;
}
// Parse Skyscanner URL parameters
function parseSkyscannerUrl(url) {
    const legs = [];
    try {
        const u = new URL(url);
        const path = u.pathname;
        // Path format: /transport/flights/lax/tyo/261005/261018/config/...
        const pathParts = path.split("/").filter(Boolean);
        const flightsIdx = pathParts.indexOf("flights");
        if (flightsIdx === -1) return legs;
        const from = (pathParts[flightsIdx + 1] || "").toUpperCase();
        const to = (pathParts[flightsIdx + 2] || "").toUpperCase();
        const outDateStr = pathParts[flightsIdx + 3] || "";
        const retDateStr = pathParts[flightsIdx + 4] || "";
        // Parse Skyscanner date format: YYMMDD → 20YY-MM-DD
        function parseSkyscannerDate(d) {
            if (!d || d.length !== 6) return null;
            return `20${d.slice(0, 2)}-${d.slice(2, 4)}-${d.slice(4, 6)}`;
        }
        const outDate = parseSkyscannerDate(outDateStr);
        const retDate = parseSkyscannerDate(retDateStr);
        // Try parsing the config segment for more detail
        const configIdx = pathParts.indexOf("config");
        let outboundCarrier = null;
        let returnCarrier = null;
        if (configIdx !== -1 && pathParts[configIdx + 1]) {
            const config = decodeURIComponent(pathParts[configIdx + 1]);
            // Format: 13416-2610051025--30816-0-14788-2610061410|14788-2610181435--30816-0-13416-2610180825
            const segments = config.split("|");
            segments.forEach((seg, i)=>{
                // Try to extract times from the segment
                const timeMatches = seg.match(/(\d{6})(\d{4})/g);
                if (timeMatches && timeMatches.length >= 1) {
                    // First match is departure datetime YYMMDDHHMM
                    const depMatch = timeMatches[0];
                    const depDate = `20${depMatch.slice(0, 2)}-${depMatch.slice(2, 4)}-${depMatch.slice(4, 6)}`;
                    const depTime = `${depMatch.slice(6, 8)}:${depMatch.slice(8, 10)}`;
                    // If there's a second time, it's the arrival
                    let arrDate = null;
                    let arrTime = null;
                    if (timeMatches.length >= 2) {
                        const arrMatch = timeMatches[timeMatches.length - 1];
                        arrDate = `20${arrMatch.slice(0, 2)}-${arrMatch.slice(2, 4)}-${arrMatch.slice(4, 6)}`;
                        arrTime = `${arrMatch.slice(6, 8)}:${arrMatch.slice(8, 10)}`;
                    }
                    legs.push({
                        direction: i === 0 ? "outbound" : "return",
                        departure_airport: i === 0 ? from : to,
                        arrival_airport: i === 0 ? to : from,
                        departure_date: depDate,
                        departure_time: depTime,
                        arrival_date: arrDate,
                        arrival_time: arrTime,
                        leg_order: i,
                        cabin_class: new URL(url).searchParams.get("cabinclass") || "economy"
                    });
                }
            });
        }
        // Fallback if config parsing didn't work
        if (legs.length === 0) {
            if (outDate) {
                legs.push({
                    direction: "outbound",
                    departure_airport: from,
                    arrival_airport: to,
                    departure_date: outDate,
                    leg_order: 0,
                    cabin_class: u.searchParams.get("cabinclass") || "economy"
                });
            }
            if (retDate) {
                legs.push({
                    direction: "return",
                    departure_airport: to,
                    arrival_airport: from,
                    departure_date: retDate,
                    leg_order: 1,
                    cabin_class: u.searchParams.get("cabinclass") || "economy"
                });
            }
        }
    } catch (e) {
        console.error("Skyscanner URL parse error:", e);
    }
    return legs;
}
// Parse Google Flights URL
// Share links (/s/shortcode) are opaque short URLs.
// Full browser URLs have a base64-encoded protobuf `tfs` parameter
// containing airport codes and dates as plain strings.
function parseGoogleFlightsUrl(url) {
    const legs = [];
    try {
        const u = new URL(url);
        // Check for share link format: /travel/flights/s/XXXX
        if (u.pathname.includes("/s/")) {
            legs._isShareLink = true;
            return legs;
        }
        // Try the tfs parameter (base64-encoded protobuf)
        const tfs = u.searchParams.get("tfs");
        if (tfs) {
            const decoded = tryDecodeTfs(tfs);
            if (decoded.length > 0) {
                // Also try to extract price from the tfu parameter
                const tfu = u.searchParams.get("tfu");
                if (tfu) {
                    const priceInfo = tryExtractPriceFromTfu(tfu);
                    if (priceInfo) {
                        decoded._price = priceInfo.price;
                        decoded._currency = priceInfo.currency;
                    }
                }
                return decoded;
            }
        }
        // Fallback: scan the entire URL for airport codes
        const fullUrl = decodeURIComponent(url);
        const airportPattern = /\b([A-Z]{3})\b/g;
        const foundCodes = [];
        let match;
        while((match = airportPattern.exec(fullUrl)) !== null){
            if (AIRPORT_CITIES[match[1]]) foundCodes.push(match[1]);
        }
        const unique = [
            ...new Set(foundCodes)
        ];
        if (unique.length >= 2) {
            legs.push({
                direction: "outbound",
                departure_airport: unique[0],
                arrival_airport: unique[1],
                leg_order: 0
            });
            legs.push({
                direction: "return",
                departure_airport: unique[1],
                arrival_airport: unique[0],
                leg_order: 1
            });
        }
    } catch (e) {
        console.error("Google Flights URL parse error:", e);
    }
    return legs;
}
// Decode the tfs base64 protobuf parameter.
// Protobuf stores strings as length-delimited fields: [field_tag] [length] [string_bytes]
// Each flight leg block contains: field1=dep_airport, field2=date, field3=arr_airport, field5=airline, field6=flight_num
function tryDecodeTfs(tfs) {
    const legs = [];
    try {
        // Base64 decode (handle URL-safe base64)
        const b64 = tfs.replace(/-/g, "+").replace(/_/g, "/");
        const raw = atob(b64);
        // Extract protobuf length-delimited string fields
        // Wire type 2 = length-delimited: tag byte has (field_number << 3) | 2
        const protoStrings = [];
        for(let i = 0; i < raw.length - 2; i++){
            const tag = raw.charCodeAt(i);
            if ((tag & 0x07) !== 2) continue; // not wire type 2
            const len = raw.charCodeAt(i + 1);
            if (len < 1 || len > 50) continue;
            if (i + 2 + len > raw.length) continue;
            // Check if all bytes are printable ASCII
            let allPrintable = true;
            let str = "";
            for(let j = 0; j < len; j++){
                const c = raw.charCodeAt(i + 2 + j);
                if (c < 32 || c > 126) {
                    allPrintable = false;
                    break;
                }
                str += String.fromCharCode(c);
            }
            if (allPrintable && str.length >= 2) {
                const fieldNum = tag >> 3;
                protoStrings.push({
                    field: fieldNum,
                    text: str,
                    pos: i
                });
            }
        }
        // Now group into leg blocks using the known field pattern:
        // Each leg: field1=dep_airport(3 chars), field2=date(10 chars), field3=arr_airport(3 chars),
        //           field5=airline(2 chars), field6=flight_num(digits)
        // The block starts with a date at field2, followed by field1=dep, field2=date, field3=arr, field5=airline, field6=flight
        let i = 0;
        while(i < protoStrings.length){
            const s = protoStrings[i];
            // Look for a date string (YYYY-MM-DD) — this signals the start of a leg block
            if (s.text.match(/^20\d{2}-\d{2}-\d{2}$/)) {
                const legData = {
                    date: s.text
                };
                // Scan the next several strings for dep, arr, airline, flight number
                for(let j = i + 1; j < Math.min(i + 8, protoStrings.length); j++){
                    const next = protoStrings[j];
                    // Skip duplicate date
                    if (next.text === legData.date) continue;
                    // If we hit another date, this leg block is done
                    if (next.text.match(/^20\d{2}-\d{2}-\d{2}$/) && next.text !== legData.date) break;
                    // field 1 = departure airport (3 uppercase letters)
                    if (next.field === 1 && next.text.match(/^[A-Z]{3}$/) && !legData.dep) {
                        legData.dep = next.text;
                        continue;
                    }
                    // field 3 = arrival airport
                    if (next.field === 3 && next.text.match(/^[A-Z]{3}$/) && !legData.arr) {
                        legData.arr = next.text;
                        continue;
                    }
                    // field 5 = airline code (2 uppercase letters)
                    if (next.field === 5 && next.text.match(/^[A-Z]{2}$/) && !legData.airline) {
                        legData.airline = next.text;
                        continue;
                    }
                    // field 6 = flight number (digits)
                    if (next.field === 6 && next.text.match(/^\d{1,5}$/) && !legData.flightNum) {
                        legData.flightNum = next.text;
                        continue;
                    }
                }
                // If we got at least dep and arr, this is a valid leg
                if (legData.dep && legData.arr) {
                    legs.push({
                        direction: legs.length === 0 ? "outbound" : "return",
                        departure_airport: legData.dep,
                        arrival_airport: legData.arr,
                        departure_date: legData.date,
                        airline_code: legData.airline || null,
                        airline_name: legData.airline ? getAirlineName(legData.airline) : null,
                        flight_number: legData.airline && legData.flightNum ? `${legData.airline} ${legData.flightNum}` : null,
                        cabin_class: "economy",
                        leg_order: legs.length
                    });
                }
            }
            i++;
        }
    } catch (e) {
        console.error("tfs decode error:", e);
    }
    return legs;
}
// Extract price from the tfu parameter (Google Flights booking URL)
// The tfu contains a nested protobuf with a price sub-message: { field1: amount_cents, field3: "USD" }
function tryExtractPriceFromTfu(tfu) {
    try {
        const b64 = tfu.replace(/-/g, "+").replace(/_/g, "/");
        const raw = atob(b64);
        // Look for a currency string like "USD", "EUR", etc.
        // Then look for a varint nearby that could be a price in cents
        let currency = null;
        let currencyPos = -1;
        // Extract protobuf strings to find currency
        for(let i = 0; i < raw.length - 2; i++){
            const tag = raw.charCodeAt(i);
            if ((tag & 0x07) !== 2) continue;
            const len = raw.charCodeAt(i + 1);
            if (len !== 3) continue; // currency codes are 3 chars
            if (i + 5 > raw.length) continue;
            const str = raw.substring(i + 2, i + 5);
            if (str.match(/^[A-Z]{3}$/) && [
                "USD",
                "EUR",
                "GBP",
                "JPY",
                "KRW",
                "CAD",
                "AUD",
                "CNY",
                "THB",
                "SGD",
                "MXN"
            ].includes(str)) {
                currency = str;
                currencyPos = i;
                break;
            }
        }
        if (!currency) {
            // Try inside nested base64 (tfu sometimes contains base64 within base64)
            for(let i = 0; i < raw.length - 2; i++){
                const tag = raw.charCodeAt(i);
                if ((tag & 0x07) !== 2) continue;
                const len = raw.charCodeAt(i + 1);
                if (len < 20 || len > 120) continue;
                if (i + 2 + len > raw.length) continue;
                let str = "";
                let isB64 = true;
                for(let j = 0; j < len; j++){
                    const c = raw.charCodeAt(i + 2 + j);
                    if (c < 32 || c > 126) {
                        isB64 = false;
                        break;
                    }
                    str += String.fromCharCode(c);
                }
                if (!isB64 || str.length < 20) continue;
                // Try to base64-decode this inner string
                try {
                    const innerB64 = str.replace(/-/g, "+").replace(/_/g, "/");
                    const innerRaw = atob(innerB64);
                    // Search inner protobuf for currency and price
                    for(let k = 0; k < innerRaw.length - 2; k++){
                        const itag = innerRaw.charCodeAt(k);
                        if ((itag & 0x07) !== 2) continue;
                        const ilen = innerRaw.charCodeAt(k + 1);
                        if (ilen === 3 && k + 5 <= innerRaw.length) {
                            const istr = innerRaw.substring(k + 2, k + 5);
                            if (istr.match(/^[A-Z]{3}$/) && [
                                "USD",
                                "EUR",
                                "GBP",
                                "JPY",
                                "KRW",
                                "CAD",
                                "AUD"
                            ].includes(istr)) {
                                currency = istr;
                                // Now find the price varint in this inner protobuf
                                // Look for varints > 100 near the currency
                                for(let m = 0; m < innerRaw.length; m++){
                                    const vtag = innerRaw.charCodeAt(m);
                                    if ((vtag & 0x07) !== 0) continue;
                                    let val = 0, shift = 0, n = m + 1;
                                    while(n < innerRaw.length && innerRaw.charCodeAt(n) & 0x80){
                                        val |= (innerRaw.charCodeAt(n) & 0x7f) << shift;
                                        shift += 7;
                                        n++;
                                    }
                                    if (n < innerRaw.length) val |= (innerRaw.charCodeAt(n) & 0x7f) << shift;
                                    // Price likely between $50 and $50,000 → cents between 5000 and 5,000,000
                                    if (val >= 5000 && val <= 5000000) {
                                        return {
                                            price: val / 100,
                                            currency
                                        };
                                    }
                                }
                            }
                        }
                    }
                } catch (_) {}
            }
        }
        // If we found currency directly, look for price varint near it
        if (currency && currencyPos >= 0) {
            // Scan nearby for varint values that look like a price in cents
            const searchStart = Math.max(0, currencyPos - 30);
            const searchEnd = Math.min(raw.length, currencyPos + 10);
            for(let i = searchStart; i < searchEnd; i++){
                const tag = raw.charCodeAt(i);
                if ((tag & 0x07) !== 0) continue;
                let val = 0, shift = 0, j = i + 1;
                while(j < raw.length && raw.charCodeAt(j) & 0x80){
                    val |= (raw.charCodeAt(j) & 0x7f) << shift;
                    shift += 7;
                    j++;
                }
                if (j < raw.length) val |= (raw.charCodeAt(j) & 0x7f) << shift;
                if (val >= 5000 && val <= 5000000) {
                    return {
                        price: val / 100,
                        currency
                    };
                }
            }
        }
    } catch (e) {
        console.error("tfu price extraction error:", e);
    }
    return null;
}
// Parse United URL (similar structure to Delta sometimes)
function parseUnitedUrl(url) {
    return []; // Placeholder for future implementation
}
function parseFlightText(rawText) {
    const legs = [];
    const lines = rawText.split("\n").map((l)=>l.trim()).filter((l)=>l.length > 0);
    // Pattern: "Oct 5: SLC -> LAX 8:30 AM - 10:10 AM (AA 1290)"
    const linePattern = /(?:(\w{3,9})\s+(\d{1,2}))[\s:,]+([A-Z]{2,4})\s*(?:->|→|—|–|-|to)\s*([A-Z]{2,4})\s+([\d:]+\s*[AP]M)\s*(?:->|→|—|–|-)\s*([\d:]+\s*[AP]M(?:\s*\+\d)?)\s*(?:\(?\s*(?:([A-Z0-9]{2,3})\s*(\d{1,5}))\s*\)?)?/i;
    // Try single-line format first
    let legOrder = 0;
    for (const line of lines){
        const m = line.match(linePattern);
        if (m) {
            const monthNum = parseMonth(m[1].substring(0, 3).toUpperCase());
            const day = parseInt(m[2]);
            const year = new Date().getFullYear();
            const dateStr = monthNum > 0 ? `${year}-${String(monthNum).padStart(2, "0")}-${String(day).padStart(2, "0")}` : null;
            const airlineCode = m[7] || "";
            const flightNum = m[8] || "";
            legs.push({
                direction: legOrder === 0 ? "outbound" : "return",
                airline_code: airlineCode,
                airline_name: getAirlineName(airlineCode),
                flight_number: airlineCode && flightNum ? `${airlineCode} ${flightNum}` : "",
                departure_airport: m[3].toUpperCase(),
                arrival_airport: m[4].toUpperCase(),
                departure_date: dateStr,
                departure_time: convertTo24h(m[5]),
                arrival_time: convertTo24h(m[6]),
                leg_order: legOrder++
            });
        }
    }
    // Multi-line parsing (Google Flights copy/paste format)
    if (legs.length === 0) {
        const timePattern = /^([\d:]+\s*[AP]M)\s*(?:–|—|-|→)\s*([\d:]+\s*[AP]M(?:\s*\+\d)?)/;
        const routePattern = /^([A-Z]{2,4})\s*(?:–|—|-|→|->)\s*([A-Z]{2,4})$/;
        const dateHeader = /(?:(?:Mon|Tue|Wed|Thu|Fri|Sat|Sun)[a-z]*,?\s*)?(\w{3,9})\s+(\d{1,2})(?:\s*,?\s*(\d{4}))?/i;
        const airlinePattern = /^(?:([A-Za-z\s]+?)\s+)?([A-Z]{2})\s*(\d{1,5})$/;
        let currentDate = null;
        let pending = {};
        let order = 0;
        for (const line of lines){
            const dMatch = line.match(dateHeader);
            if (dMatch && !line.match(timePattern) && !line.match(routePattern)) {
                const mNum = parseMonth(dMatch[1].substring(0, 3).toUpperCase());
                if (mNum > 0) {
                    const yr = dMatch[3] || new Date().getFullYear();
                    currentDate = `${yr}-${String(mNum).padStart(2, "0")}-${String(parseInt(dMatch[2])).padStart(2, "0")}`;
                }
                continue;
            }
            const tMatch = line.match(timePattern);
            if (tMatch) {
                if (pending.departure_airport) {
                    legs.push({
                        ...pending,
                        direction: order === 0 ? "outbound" : "return",
                        leg_order: order++
                    });
                }
                pending = {
                    departure_time: convertTo24h(tMatch[1]),
                    arrival_time: convertTo24h(tMatch[2]),
                    departure_date: currentDate
                };
                continue;
            }
            const rMatch = line.match(routePattern);
            if (rMatch) {
                pending.departure_airport = rMatch[1];
                pending.arrival_airport = rMatch[2];
                continue;
            }
            const aMatch = line.match(airlinePattern);
            if (aMatch) {
                pending.airline_code = aMatch[2];
                pending.airline_name = aMatch[1]?.trim() || getAirlineName(aMatch[2]);
                pending.flight_number = `${aMatch[2]} ${aMatch[3]}`;
                continue;
            }
        }
        if (pending.departure_airport) {
            legs.push({
                ...pending,
                direction: order === 0 ? "outbound" : "return",
                leg_order: order
            });
        }
    }
    return legs;
}
function convertTo24h(timeStr) {
    if (!timeStr) return null;
    const clean = timeStr.replace(/\+\d$/, "").trim();
    const match = clean.match(/(\d{1,2}):?(\d{2})?\s*(AM|PM)/i);
    if (!match) return null;
    let hour = parseInt(match[1]);
    const min = match[2] || "00";
    const ampm = match[3].toUpperCase();
    if (ampm === "PM" && hour !== 12) hour += 12;
    if (ampm === "AM" && hour === 12) hour = 0;
    return `${String(hour).padStart(2, "0")}:${min}`;
}
function parseOcrText(rawText) {
    if (!rawText || rawText.trim().length < 10) return {
        legs: [],
        price: null,
        currency: null
    };
    const text = rawText.replace(/\r\n/g, "\n");
    const lines = text.split("\n").map((l)=>l.trim()).filter((l)=>l.length > 0);
    const fullText = lines.join(" ");
    // ── 1. Extract price ──
    let price = null;
    let currency = "USD";
    // Match patterns like $286.80, $ 286.80, USD 286.80, Total price $498
    const pricePatterns = [
        /(?:total\s*(?:price|cost|fare)?|airfare|price|fare)\s*:?\s*\$\s*([\d,]+(?:\.\d{2})?)/i,
        /\$\s*([\d,]+\.\d{2})/,
        /\$\s*([\d,]+)\b(?!\.\d)/,
        /([\d,]+(?:\.\d{2})?)\s*(?:USD|EUR|GBP|CAD|AUD)/i
    ];
    for (const pat of pricePatterns){
        const m = fullText.match(pat);
        if (m) {
            const val = parseFloat(m[1].replace(/,/g, ""));
            if (val >= 20 && val <= 50000) {
                price = val;
                break;
            }
        }
    }
    // Check for non-USD currency
    const currMatch = fullText.match(/\b(EUR|GBP|CAD|AUD|JPY|KRW|THB|SGD|MXN|CNY)\b/);
    if (currMatch) currency = currMatch[1];
    // ── 2. Extract airport codes ──
    // Look for codes in parentheses first: "Phoenix (PHX)", then standalone 3-letter codes
    const airportInstances = []; // { code, index, fromParens }
    const parensPattern = /\(([A-Z]{3})\)/g;
    let pm;
    while((pm = parensPattern.exec(fullText)) !== null){
        if (isKnownAirport(pm[1])) {
            airportInstances.push({
                code: pm[1],
                index: pm.index,
                fromParens: true
            });
        }
    }
    // Also look for standalone codes not already found
    const standalonePattern = /\b([A-Z]{3})\b/g;
    const NOISE_WORDS = new Set([
        "THE",
        "AND",
        "FOR",
        "ARE",
        "BUT",
        "NOT",
        "YOU",
        "ALL",
        "CAN",
        "HER",
        "WAS",
        "ONE",
        "OUR",
        "OUT",
        "DAY",
        "HAD",
        "HAS",
        "HIS",
        "HOW",
        "ITS",
        "MAY",
        "NEW",
        "NOW",
        "OLD",
        "SEE",
        "WAY",
        "WHO",
        "DID",
        "GET",
        "HIM",
        "LET",
        "SAY",
        "SHE",
        "TOO",
        "USE",
        "MOM",
        "DAD",
        "SON",
        "SIT",
        "TRY",
        "ASK",
        "MEN",
        "RUN",
        "BIG",
        "FEW",
        "TAX",
        "NET",
        "TIP",
        "FEE",
        "PER",
        "VIA",
        "EST",
        "PDT",
        "PST",
        "CST",
        "MST",
        "EDT",
        "CDT",
        "MDT",
        "GMT",
        "UTC",
        "MON",
        "TUE",
        "WED",
        "THU",
        "FRI",
        "SAT",
        "SUN",
        "JAN",
        "FEB",
        "MAR",
        "APR",
        "JUN",
        "JUL",
        "AUG",
        "SEP",
        "OCT",
        "NOV",
        "DEC",
        "USD",
        "EUR",
        "GBP",
        "CAD",
        "AUD",
        "JPY",
        "KRW",
        "THB",
        "SGD",
        "MXN",
        "CNY",
        "MIN",
        "HRS",
        "AVG",
        "MAX",
        "ADD",
        "FLY",
        "AIR",
        "JET"
    ]);
    while((pm = standalonePattern.exec(fullText)) !== null){
        if (NOISE_WORDS.has(pm[1])) continue;
        if (isKnownAirport(pm[1]) && !airportInstances.find((a)=>a.code === pm[1] && Math.abs(a.index - pm.index) < 5)) {
            airportInstances.push({
                code: pm[1],
                index: pm.index,
                fromParens: false
            });
        }
    }
    // ── 3. Extract dates ──
    const dateInstances = []; // { date: "YYYY-MM-DD", index }
    // "Wednesday, July 1" / "July 1, 2025" / "Wed Jul 1" / "Jul 1"
    const MONTHS_MAP = {
        jan: 1,
        feb: 2,
        mar: 3,
        apr: 4,
        may: 5,
        jun: 6,
        jul: 7,
        aug: 8,
        sep: 9,
        oct: 10,
        nov: 11,
        dec: 12,
        january: 1,
        february: 2,
        march: 3,
        april: 4,
        june: 6,
        july: 7,
        august: 8,
        september: 9,
        october: 10,
        november: 11,
        december: 12
    };
    const datePattern = /(?:(?:Mon|Tue|Wed|Thu|Fri|Sat|Sun)\w*[,.]?\s+)?(\w{3,9})\s+(\d{1,2})(?:\s*,?\s*(\d{4}))?/gi;
    let dm;
    while((dm = datePattern.exec(fullText)) !== null){
        const mKey = dm[1].toLowerCase();
        const monthNum = MONTHS_MAP[mKey] || MONTHS_MAP[mKey.substring(0, 3)];
        if (!monthNum) continue;
        const day = parseInt(dm[2]);
        if (day < 1 || day > 31) continue;
        const year = dm[3] ? parseInt(dm[3]) : new Date().getFullYear();
        dateInstances.push({
            date: `${year}-${String(monthNum).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
            index: dm.index
        });
    }
    // ── 4. Extract times ──
    const timeInstances = []; // { time24: "HH:MM", index }
    const timePattern = /(\d{1,2}):(\d{2})\s*(am|pm|AM|PM)/g;
    let tm;
    while((tm = timePattern.exec(fullText)) !== null){
        let h = parseInt(tm[1]);
        const min = tm[2];
        const ampm = tm[3].toUpperCase();
        if (ampm === "PM" && h !== 12) h += 12;
        if (ampm === "AM" && h === 12) h = 0;
        timeInstances.push({
            time24: `${String(h).padStart(2, "0")}:${min}`,
            index: tm.index
        });
    }
    // ── 5. Extract flight numbers ──
    const flightInstances = []; // { airline_code, flight_number, airline_name, index }
    // "AS 611", "DL 1234", "AA1290", "AS611"
    const flightPattern = /\b([A-Z]{2})\s?(\d{1,5})\b/g;
    let fm;
    while((fm = flightPattern.exec(fullText)) !== null){
        const code = fm[1];
        if (AIRLINE_NAMES[code]) {
            flightInstances.push({
                airline_code: code,
                flight_number: `${code} ${fm[2]}`,
                airline_name: getAirlineName(code),
                index: fm.index
            });
        }
    }
    // ── 6. Extract duration ──
    const durationInstances = [];
    const durPattern = /(\d{1,2})h\s*(\d{1,2})m/gi;
    let durm;
    while((durm = durPattern.exec(fullText)) !== null){
        durationInstances.push({
            minutes: parseInt(durm[1]) * 60 + parseInt(durm[2]),
            index: durm.index
        });
    }
    // ── 7. Detect direction markers ──
    const directionMarkers = []; // { direction, index }
    const depPattern = /\b(departing|outbound|depart|going|leaving)\b/gi;
    while((dm = depPattern.exec(fullText)) !== null){
        directionMarkers.push({
            direction: "outbound",
            index: dm.index
        });
    }
    const retPattern = /\b(returning|return|inbound|coming\s*back)\b/gi;
    while((dm = retPattern.exec(fullText)) !== null){
        directionMarkers.push({
            direction: "return",
            index: dm.index
        });
    }
    directionMarkers.sort((a, b)=>a.index - b.index);
    // ── 8. Also detect airline names in text ──
    const AIRLINE_FULLNAMES = {
        "alaska": "AS",
        "delta": "DL",
        "american": "AA",
        "united": "UA",
        "southwest": "WN",
        "jetblue": "B6",
        "spirit": "NK",
        "frontier": "F9",
        "hawaiian": "HA",
        "korean air": "KE",
        "cathay pacific": "CX",
        "singapore airlines": "SQ",
        "british airways": "BA",
        "lufthansa": "LH",
        "air france": "AF",
        "emirates": "EK",
        "qatar": "QR",
        "ana": "NH",
        "jal": "JL"
    };
    let detectedAirline = null;
    for (const [name, code] of Object.entries(AIRLINE_FULLNAMES)){
        if (fullText.toLowerCase().includes(name)) {
            detectedAirline = {
                code,
                name: getAirlineName(code)
            };
            break;
        }
    }
    // ── 9. Also look for "City (CODE) to City (CODE)" patterns ──
    const cityRoutePattern = /([A-Za-z\s]+?)\s*\(([A-Z]{3})\)\s*(?:to|→|->|—|–)\s*([A-Za-z\s]+?)\s*\(([A-Z]{3})\)/g;
    const routeInstances = [];
    let routeMatch;
    while((routeMatch = cityRoutePattern.exec(fullText)) !== null){
        routeInstances.push({
            from: routeMatch[2],
            to: routeMatch[4],
            index: routeMatch.index
        });
    }
    // ── BUILD LEGS ──
    const legs = [];
    if (routeInstances.length > 0) {
        // Best case: we found explicit "City (CODE) to City (CODE)" patterns
        for(let i = 0; i < routeInstances.length; i++){
            const route = routeInstances[i];
            // Section boundaries: from this route's index to the next route's index
            const sectionStart = route.index;
            const sectionEnd = i < routeInstances.length - 1 ? routeInstances[i + 1].index : Infinity;
            const nearDate = _findInSection(dateInstances, sectionStart, sectionEnd);
            const nearTimes = _findAllInSection(timeInstances, sectionStart, sectionEnd);
            const nearFlight = _findInSection(flightInstances, sectionStart, sectionEnd);
            const nearDur = _findInSection(durationInstances, sectionStart, sectionEnd);
            // For direction, find the closest marker that appears BEFORE this route (within 100 chars)
            let direction = i === 0 ? "outbound" : "return";
            const nearDir = directionMarkers.filter((d)=>d.index < sectionStart && d.index >= sectionStart - 100).sort((a, b)=>b.index - a.index)[0];
            if (nearDir) direction = nearDir.direction;
            legs.push({
                direction,
                departure_airport: route.from,
                arrival_airport: route.to,
                departure_date: nearDate?.date || null,
                departure_time: nearTimes[0]?.time24 || null,
                arrival_time: nearTimes[1]?.time24 || null,
                airline_code: nearFlight?.airline_code || detectedAirline?.code || null,
                airline_name: nearFlight?.airline_name || detectedAirline?.name || null,
                flight_number: nearFlight?.flight_number || null,
                duration_minutes: nearDur?.minutes || null,
                leg_order: i
            });
        }
    } else if (airportInstances.length >= 2) {
        // Fallback: pair airports using direction markers as section boundaries
        if (directionMarkers.length >= 2) {
            for(let d = 0; d < directionMarkers.length; d++){
                const marker = directionMarkers[d];
                const sectionEnd = d < directionMarkers.length - 1 ? directionMarkers[d + 1].index : Infinity;
                const sectionAirports = airportInstances.filter((a)=>a.index >= marker.index && a.index < sectionEnd);
                const sectionDates = dateInstances.filter((a)=>a.index >= marker.index && a.index < sectionEnd);
                const sectionTimes = timeInstances.filter((a)=>a.index >= marker.index && a.index < sectionEnd);
                const sectionFlights = flightInstances.filter((a)=>a.index >= marker.index && a.index < sectionEnd);
                const sectionDurs = durationInstances.filter((a)=>a.index >= marker.index && a.index < sectionEnd);
                if (sectionAirports.length >= 2) {
                    legs.push({
                        direction: marker.direction,
                        departure_airport: sectionAirports[0].code,
                        arrival_airport: sectionAirports[1].code,
                        departure_date: sectionDates[0]?.date || null,
                        departure_time: sectionTimes[0]?.time24 || null,
                        arrival_time: sectionTimes[1]?.time24 || null,
                        airline_code: sectionFlights[0]?.airline_code || detectedAirline?.code || null,
                        airline_name: sectionFlights[0]?.airline_name || detectedAirline?.name || null,
                        flight_number: sectionFlights[0]?.flight_number || null,
                        duration_minutes: sectionDurs[0]?.minutes || null,
                        leg_order: legs.length
                    });
                }
            }
        } else {
            // No direction markers — deduplicate only immediately adjacent same codes (OCR duplicates), then pair
            const uniqueRouteAirports = [];
            for(let ai = 0; ai < airportInstances.length; ai++){
                const a = airportInstances[ai];
                const prev = uniqueRouteAirports[uniqueRouteAirports.length - 1];
                // Skip if same code AND very close position (likely OCR duplicate)
                if (prev && prev.code === a.code && a.index - prev.index < 30) continue;
                uniqueRouteAirports.push(a);
            }
            for(let i = 0; i + 1 < uniqueRouteAirports.length; i += 2){
                const from = uniqueRouteAirports[i];
                const to = uniqueRouteAirports[i + 1];
                const sectionStart = from.index;
                const sectionEnd = i + 2 < uniqueRouteAirports.length ? uniqueRouteAirports[i + 2].index : Infinity;
                const nearDate = _findInSection(dateInstances, sectionStart, sectionEnd);
                const nearTimes = _findAllInSection(timeInstances, sectionStart, sectionEnd);
                const nearFlight = _findInSection(flightInstances, sectionStart, sectionEnd);
                const nearDur = _findInSection(durationInstances, sectionStart, sectionEnd);
                legs.push({
                    direction: legs.length === 0 ? "outbound" : "return",
                    departure_airport: from.code,
                    arrival_airport: to.code,
                    departure_date: nearDate?.date || null,
                    departure_time: nearTimes[0]?.time24 || null,
                    arrival_time: nearTimes[1]?.time24 || null,
                    airline_code: nearFlight?.airline_code || detectedAirline?.code || null,
                    airline_name: nearFlight?.airline_name || detectedAirline?.name || null,
                    flight_number: nearFlight?.flight_number || null,
                    duration_minutes: nearDur?.minutes || null,
                    leg_order: legs.length
                });
            }
        }
    }
    return {
        legs,
        price,
        currency
    };
}
// Helper: find the nearest item within a strict section [start, end)
function _findInSection(items, start, end) {
    let best = null, bestDist = Infinity;
    for (const item of items){
        if (item.index < start || item.index >= end) continue;
        const dist = Math.abs(item.index - start);
        if (dist < bestDist) {
            bestDist = dist;
            best = item;
        }
    }
    return best;
}
// Helper: find all items in a strict section [start, end), sorted by index
function _findAllInSection(items, start, end) {
    return items.filter((i)=>i.index >= start && i.index < end).sort((a, b)=>a.index - b.index);
}
// Broad airport code check
function isKnownAirport(code) {
    if (AIRPORT_CITIES[code]) return true;
    const MORE_AIRPORTS = [
        "ANC",
        "ABQ",
        "AUS",
        "BNA",
        "BDL",
        "BUF",
        "BWI",
        "CHS",
        "CLE",
        "CMH",
        "CVG",
        "DAL",
        "DSM",
        "ELP",
        "FLL",
        "GRR",
        "GSO",
        "GSP",
        "HOU",
        "IND",
        "JAX",
        "MCI",
        "MEM",
        "MKE",
        "MSY",
        "OAK",
        "OKC",
        "OMA",
        "ONT",
        "PBI",
        "PIT",
        "PVD",
        "RDU",
        "RIC",
        "RNO",
        "RSW",
        "SAT",
        "SDF",
        "SJC",
        "SJU",
        "SMF",
        "SNA",
        "STL",
        "TUL",
        "TUS"
    ];
    return MORE_AIRPORTS.includes(code);
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/detailPaneStyles.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// ─────────────────────────────────────────────────────────────
// SINGLE SOURCE OF TRUTH — Detail Pane Shared Styles
// ─────────────────────────────────────────────────────────────
// Every option detail panel imports label styles from here.
// Change a token once and it updates across all five modules,
// EditableNotes, MiniWeekCalendar, and any future detail UI.
// ─────────────────────────────────────────────────────────────
/** Uppercase section/field label above a value or group (e.g. "Address", "Duration", "Known for") */ __turbopack_context__.s([
    "LABEL",
    ()=>LABEL,
    "LABEL_MB1",
    ()=>LABEL_MB1,
    "LABEL_MB2",
    ()=>LABEL_MB2,
    "default",
    ()=>__TURBOPACK__default__export__
]);
const LABEL = "text-xs text-slate-400 uppercase tracking-wide";
const LABEL_MB1 = "text-xs text-slate-400 uppercase tracking-wide mb-1";
const LABEL_MB2 = "text-xs text-slate-400 uppercase tracking-wide mb-2";
const __TURBOPACK__default__export__ = {
    LABEL,
    LABEL_MB1,
    LABEL_MB2
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/categoryColors.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
// ─────────────────────────────────────────────────────────────
// SINGLE SOURCE OF TRUTH — Category Colors
// ─────────────────────────────────────────────────────────────
// Every component that needs a category color imports from here.
// If you change a color, it updates everywhere: calendar cells,
// day detail cards, option modules, budget charts, map pins,
// and any future UI that references these categories.
// ─────────────────────────────────────────────────────────────
const CATEGORY_COLORS = {
    flight: {
        // Emerald family
        hex: "#10b981",
        hexLight: "#34d399",
        bg: "bg-emerald-50",
        bgMedium: "bg-emerald-100",
        border: "border-emerald-200",
        text: "text-emerald-700",
        textDark: "text-emerald-600",
        dot: "bg-emerald-400",
        bar: "bg-emerald-400",
        pill: "bg-emerald-100 text-emerald-700",
        chart: "#34d399"
    },
    accommodation: {
        // Sky family
        hex: "#0ea5e9",
        hexLight: "#38bdf8",
        bg: "bg-sky-50",
        bgMedium: "bg-sky-100",
        border: "border-sky-200",
        text: "text-sky-700",
        textDark: "text-sky-600",
        dot: "bg-sky-400",
        bar: "bg-sky-400",
        pill: "bg-sky-100 text-sky-700",
        chart: "#38bdf8"
    },
    activity: {
        // Amber/Yellow family
        hex: "#eab308",
        hexLight: "#facc15",
        bg: "bg-yellow-50",
        bgMedium: "bg-yellow-100",
        border: "border-yellow-200",
        text: "text-yellow-700",
        textDark: "text-yellow-600",
        dot: "bg-yellow-400",
        bar: "bg-yellow-400",
        pill: "bg-yellow-100 text-yellow-700",
        chart: "#facc15"
    },
    dining: {
        // Orange family
        hex: "#f97316",
        hexLight: "#fb923c",
        bg: "bg-orange-50",
        bgMedium: "bg-orange-100",
        border: "border-orange-200",
        text: "text-orange-700",
        textDark: "text-orange-600",
        dot: "bg-orange-400",
        bar: "bg-orange-400",
        pill: "bg-orange-100 text-orange-700",
        chart: "#fb923c"
    },
    transportation: {
        // Violet family
        hex: "#8b5cf6",
        hexLight: "#a78bfa",
        bg: "bg-violet-50",
        bgMedium: "bg-violet-100",
        border: "border-violet-200",
        text: "text-violet-700",
        textDark: "text-violet-600",
        dot: "bg-violet-400",
        bar: "bg-violet-400",
        pill: "bg-violet-100 text-violet-700",
        chart: "#a78bfa"
    },
    dayEvent: {
        // Stone family (user-created events)
        hex: "#78716c",
        hexLight: "#a8a29e",
        bg: "bg-stone-50",
        bgMedium: "bg-stone-100",
        border: "border-stone-200",
        text: "text-stone-600",
        textDark: "text-stone-600",
        dot: "bg-stone-400",
        bar: "bg-stone-400",
        pill: "bg-stone-100 text-stone-600",
        chart: "#a8a29e"
    },
    misc: {
        // Slate family (other expenses, catch-all)
        hex: "#64748b",
        hexLight: "#94a3b8",
        bg: "bg-slate-50",
        bgMedium: "bg-slate-100",
        border: "border-slate-200",
        text: "text-slate-700",
        textDark: "text-slate-600",
        dot: "bg-slate-400",
        bar: "bg-slate-400",
        pill: "bg-slate-100 text-slate-700",
        chart: "#94a3b8"
    }
};
// ── Aliases so components can use their own naming conventions ──
// "transport" is used by budget/map, "transportation" by page.js/options
CATEGORY_COLORS.transport = CATEGORY_COLORS.transportation;
const __TURBOPACK__default__export__ = CATEGORY_COLORS;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=src_lib_0qc7f38._.js.map