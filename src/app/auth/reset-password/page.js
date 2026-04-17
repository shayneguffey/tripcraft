"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const router = useRouter();

  // Wait for Supabase to pick up the recovery token from the URL
  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setReady(true);
      }
    });
    return () => listener?.subscription?.unsubscribe();
  }, []);

  async function handleReset(e) {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push("/trips");
    }
  }

  return (
    <div
      className="flex min-h-screen items-center justify-center px-4"
      style={{
        background:
          "radial-gradient(ellipse at 50% 45%, rgba(222,210,190,0.95) 0%, rgba(195,178,155,0.98) 55%, rgba(160,140,115,1) 100%)",
      }}
    >
      <div className="w-full max-w-sm">
        <h1
          className="text-2xl font-semibold text-center mb-2"
          style={{ color: "#4a3728", fontFamily: "var(--font-playfair)" }}
        >
          Reset Your Password
        </h1>
        <p className="text-center text-sm mb-6" style={{ color: "#6b5a4a" }}>
          Enter a new password for your account.
        </p>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50/90 text-red-700 text-sm">
            {error}
          </div>
        )}

        {!ready ? (
          <div className="text-center py-8">
            <p style={{ color: "#6b5a4a" }}>Verifying your reset link...</p>
          </div>
        ) : (
          <form onSubmit={handleReset}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="New password (min 6 chars)"
              className="w-full px-3 py-2.5 mb-3 rounded-lg text-sm
                         bg-white/90 border border-stone-300 text-stone-800 placeholder-stone-400
                         focus:outline-none focus:ring-2 focus:ring-[#da7b4a]/50 focus:border-transparent"
            />
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="Confirm new password"
              className="w-full px-3 py-2.5 mb-3 rounded-lg text-sm
                         bg-white/90 border border-stone-300 text-stone-800 placeholder-stone-400
                         focus:outline-none focus:ring-2 focus:ring-[#da7b4a]/50 focus:border-transparent"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg font-semibold transition-shadow
                         bg-[#da7b4a] text-white
                         hover:ring-2 hover:ring-white
                         disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Updating..." : "Set New Password"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
