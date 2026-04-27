"use client";

/* ══════════════════════════════════════════════════════════════════
   CategoryIcon — single-source-of-truth icon mapping for the app.
   ──────────────────────────────────────────────────────────────────
   Uses lucide-react icons matching the planning-page tab strip so
   the visual language is consistent everywhere a category is shown:
   calendar cells, day cards, option modules, map pins, budget chips,
   pocket guide, etc.

   Usage:
     import CategoryIcon from "@/components/CategoryIcon";
     <CategoryIcon kind="flight" size={16} />
     <CategoryIcon kind="dining" className="text-orange-500" />

   Or grab the underlying lucide component:
     import { getCategoryIcon } from "@/components/CategoryIcon";
     const Icon = getCategoryIcon("activity");

   Recognized kinds (case-insensitive):
     flight | flights        → Plane
     accommodation | stay    → Bed
     activity | activities   → Star
     dining | food           → UtensilsCrossed
     transport | transportation → ArrowLeftRight
     map                     → MapPin
     budget                  → CircleDollarSign
     checklist               → ClipboardCheck
     packing                 → Briefcase
     documents | resources   → Folder
     travelers | collaborators → Users
   ══════════════════════════════════════════════════════════════════ */

import {
  Plane, Bed, Star, UtensilsCrossed, ArrowLeftRight, MapPin,
  CircleDollarSign, ClipboardCheck, Briefcase, Folder, Users,
} from "lucide-react";

const ICON_MAP = {
  flight: Plane,
  flights: Plane,
  accommodation: Bed,
  accommodations: Bed,
  stay: Bed,
  stays: Bed,
  activity: Star,
  activities: Star,
  dining: UtensilsCrossed,
  food: UtensilsCrossed,
  transport: ArrowLeftRight,
  transportation: ArrowLeftRight,
  map: MapPin,
  budget: CircleDollarSign,
  checklist: ClipboardCheck,
  packing: Briefcase,
  documents: Folder,
  resources: Folder,
  travelers: Users,
  collaborators: Users,
};

export function getCategoryIcon(kind) {
  if (!kind) return null;
  return ICON_MAP[String(kind).toLowerCase()] || null;
}

export default function CategoryIcon({ kind, size = 16, strokeWidth = 1.7, ...rest }) {
  const Icon = getCategoryIcon(kind);
  if (!Icon) return null;
  return <Icon size={size} strokeWidth={strokeWidth} aria-hidden {...rest} />;
}
