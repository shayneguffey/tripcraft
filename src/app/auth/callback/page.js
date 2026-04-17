"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const isPopup = window.opener && window.opener !== window;

    async function handleCallback() {
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) {
        console.error("Auth callback error:", error);
        if (isPopup) {
          window.close();
        } else {
          router.push("/login?error=auth_failed");
        }
        return;
      }

      function onSignedIn() {
        if (isPopup) {
          // Close the popup — the parent page's onAuthStateChange listener
          // will detect the sign-in and redirect to /trips
          window.close();
          return;
        }

        // Normal redirect flow
        const pendingInvite = localStorage.getItem("pending_invite_token");
        if (pendingInvite) {
          localStorage.removeItem("pending_invite_token");
          router.push(`/invite/${pendingInvite}`);
        } else {
          router.push("/trips");
        }
      }

      if (session) {
        onSignedIn();
      } else {
        // No session yet — wait for auth state change
        const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
          if (event === "SIGNED_IN" && session) {
            listener?.subscription?.unsubscribe();
            onSignedIn();
          }
        });
      }
    }

    handleCallback();
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-sky-50 to-white">
      <div className="text-center">
        <div className="text-4xl mb-4 animate-bounce">✈️</div>
        <p className="text-slate-500">Signing you in...</p>
      </div>
    </div>
  );
}
