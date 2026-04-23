"use client";

// This route used to render a standalone login form, but the landing page's
// inline auth panel is the real login surface. Keeping /login around as a
// redirect prevents stale bookmarks, external links, and browser history
// from dumping users onto an orphan page. router.replace is used so this
// URL doesn't linger in back-button history.
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import FlightPathLoader from "@/components/FlightPathLoader";

export default function LoginRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/?auth=login");
  }, [router]);
  return <FlightPathLoader text="Opening sign-in..." />;
}
