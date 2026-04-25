"use client";

/**
 * AccountMenu — circular avatar button with dropdown.
 *
 * Used on the dashboard (`/trips`) and the trip planning page
 * (`/trips/[id]`). Anywhere a signed-in user needs quick access to
 * their email, archived trips, and sign-out.
 *
 * Props:
 *   variant   "light" (default) | "dark"
 *               "light" = stone tones, suitable for parchment/light
 *                         backgrounds (dashboard)
 *               "dark"  = white-on-dark, suitable for sitting on top
 *                         of a banner image (planning page)
 *
 * The component owns its own auth fetch + sign-out handling — drop it
 * in and forget about it.
 */

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AccountMenu({ variant = "light" }) {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!cancelled) setUser(user);
    })();
    return () => { cancelled = true; };
  }, []);

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/");
  }

  const isDark = variant === "dark";
  const buttonClass = isDark
    ? "w-10 h-10 rounded-full text-white/90 flex items-center justify-center backdrop-blur-sm hover:brightness-110 transition-all"
    : "w-12 h-12 rounded-full bg-stone-800/20 text-stone-700 flex items-center justify-center backdrop-blur-sm hover:bg-[#da7b4a]/30 hover:text-[#b5552a] transition-colors";
  const buttonStyle = isDark
    ? { background: "rgba(30,22,12,0.55)", border: "1px solid rgba(212,165,116,0.25)" }
    : undefined;
  const iconSize = isDark ? "w-5 h-5" : "w-6 h-6";

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={buttonClass}
        style={buttonStyle}
        title="Account"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className={iconSize}>
          <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM12.735 14c.618 0 1.093-.561.872-1.139a6.002 6.002 0 0 0-11.215 0c-.22.578.255 1.139.872 1.139h9.47Z" />
        </svg>
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-12 z-40 w-56 bg-white rounded-xl shadow-xl border border-stone-200 py-2 overflow-hidden">
            <div className="px-4 py-2 border-b border-stone-100">
              <p className="text-xs text-stone-400">Signed in as</p>
              <p className="text-sm text-stone-700 font-medium truncate">{user?.email}</p>
            </div>
            <Link
              href="/trips"
              className="block px-4 py-2.5 text-sm text-stone-600 hover:bg-stone-50 transition-colors"
              onClick={() => setOpen(false)}
            >
              My Trips
            </Link>
            <Link
              href="/archived"
              className="block px-4 py-2.5 text-sm text-stone-600 hover:bg-stone-50 transition-colors"
              onClick={() => setOpen(false)}
            >
              Archived Trips
            </Link>
            <button
              onClick={handleSignOut}
              className="w-full text-left px-4 py-2.5 text-sm text-stone-600 hover:bg-stone-50 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </>
      )}
    </div>
  );
}
