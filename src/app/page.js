"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import HomeGlobeAnimated from "@/components/HomeGlobeAnimated";
import MapPatternBg from "@/components/MapPatternBg";

export default function Home() {
  const [showAuth, setShowAuth] = useState(false);
  const [mode, setMode] = useState("login"); // "login", "signup", or "forgot"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Auto-open the auth modal when the URL carries ?auth=login or ?auth=signup
  // (used by redirect stubs at /login and /signup so the standalone routes
  // stay out of history but still land on the login form).
  useEffect(() => {
    const authParam = searchParams?.get("auth");
    if (authParam === "login" || authParam === "signup" || authParam === "forgot") {
      setMode(authParam);
      setShowAuth(true);
    }
  }, [searchParams]);

  // Handle OAuth — listen for sign-in from popup or redirect
  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN") {
        router.push("/trips");
      }
    });
    return () => listener?.subscription?.unsubscribe();
  }, [router]);

  async function handleForgotPassword(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });

    if (error) {
      setError(error.message);
    } else {
      setSuccess("Check your email for a password reset link.");
    }
    setLoading(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (mode === "signup") {
      if (password !== confirmPassword) {
        setError("Passwords do not match");
        setLoading(false);
        return;
      }
      if (password.length < 6) {
        setError("Password must be at least 6 characters");
        setLoading(false);
        return;
      }
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setError(error.message);
        setLoading(false);
      } else {
        router.push("/trips");
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError(error.message);
        setLoading(false);
      } else {
        router.push("/trips");
      }
    }
  }

  async function handleGoogleAuth() {
    setGoogleLoading(true);
    setError(null);

    // Get the OAuth URL without redirecting the browser
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?popup=1`,
        skipBrowserRedirect: true,
      },
    });

    if (error) {
      setError(error.message);
      setGoogleLoading(false);
      return;
    }

    // Open Google auth in a centered popup window
    if (data?.url) {
      const width = 500;
      const height = 600;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;

      const popup = window.open(
        data.url,
        "google-auth",
        `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no,scrollbars=yes`
      );

      // Poll for popup close
      if (popup) {
        const pollTimer = setInterval(() => {
          if (popup.closed) {
            clearInterval(pollTimer);
            setGoogleLoading(false);
          }
        }, 500);
      } else {
        // Popup was blocked — fall back to full redirect
        await supabase.auth.signInWithOAuth({
          provider: "google",
          options: {
            redirectTo: `${window.location.origin}/auth/callback`,
          },
        });
      }
    }
  }

  function toggleMode() {
    setMode(mode === "login" ? "signup" : "login");
    setError(null);
    setSuccess(null);
    setPassword("");
    setConfirmPassword("");
  }

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Background — warm stone gradient */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, rgba(210,195,172,0.7) 0%, rgba(222,210,190,0.6) 50%, rgba(210,195,172,0.7) 100%)",
        }}
      />

      {/* Map pattern overlay */}
      <MapPatternBg tileSize={280} opacity={1} />

      {/* Globe — fills the viewport, centered */}
      <HomeGlobeAnimated />

      {/* Content overlay — logo + CTA + auth panel */}
      <div
        className="relative z-10 flex flex-col items-center justify-center h-full px-6"
        onClick={(e) => {
          if (showAuth && e.target === e.currentTarget) {
            setShowAuth(false);
            setError(null);
          }
        }}
      >
        {/* Soft radial glow behind logo */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 55% 50% at 50% 48%, rgba(235,225,210,0.88) 0%, rgba(230,220,200,0.55) 40%, transparent 72%)",
          }}
        />

        <div className="relative flex flex-col items-center">
          {/* Logo */}
          <img
            src="/TRIPCRAFTLOGO.png"
            alt="TripCraft"
            className="select-none"
            style={{
              height: 560,
              width: "auto",
            }}
            draggable={false}
          />

          {/* CTA button — only visible when auth panel is hidden */}
          <div
            className="flex flex-col items-center transition-all duration-500 ease-in-out px-4 pb-4"
            style={{
              maxHeight: showAuth ? 0 : 140,
              opacity: showAuth ? 0 : 1,
              overflow: "hidden",
            }}
          >
            <button
              onClick={() => setShowAuth(true)}
              className="mt-6 px-10 py-2.5 rounded-lg text-lg font-semibold tracking-wide transition-shadow
                         bg-[#da7b4a] text-white
                         hover:ring-2 hover:ring-white"
            >
              Start Planning
            </button>

            <Link
              href="/learn-more"
              className="mt-5 text-lg text-white hover:text-white/80 transition-colors"
            >
              Learn More
            </Link>
          </div>

          {/* Auth panel — slides down when showAuth is true */}
          <div
            className="transition-all duration-500 ease-in-out overflow-hidden px-4"
            style={{
              maxHeight: showAuth ? 600 : 0,
              opacity: showAuth ? 1 : 0,
            }}
          >
            <div className="w-80 mt-1 pt-2 pb-2">
              {error && (
                <div className="mb-3 p-3 rounded-lg bg-red-50/90 text-red-700 text-sm">
                  {error}
                </div>
              )}

              {success && (
                <div className="mb-3 p-3 rounded-lg bg-green-50/90 text-green-700 text-sm">
                  {success}
                </div>
              )}

              {mode === "forgot" ? (
                <>
                  {/* Forgot password form */}
                  <div className="text-center mb-4 text-sm text-white/90">
                    Enter your email and we'll send you a reset link.
                  </div>
                  <form onSubmit={handleForgotPassword}>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="Email"
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
                      {loading ? "Sending..." : "Send Reset Link"}
                    </button>
                  </form>

                  <div className="flex items-center justify-between mt-3">
                    <button
                      onClick={() => { setMode("login"); setError(null); setSuccess(null); }}
                      className="px-4 py-1.5 rounded-lg text-xs font-semibold transition-shadow
                                 bg-[#da7b4a] text-white hover:ring-2 hover:ring-white"
                    >
                      Back to sign in
                    </button>
                    <button
                      onClick={() => { setShowAuth(false); setError(null); setSuccess(null); }}
                      className="px-4 py-1.5 rounded-lg text-xs font-semibold transition-shadow
                                 bg-[#da7b4a] text-white hover:ring-2 hover:ring-white"
                    >
                      Back
                    </button>
                  </div>
                </>
              ) : (
                <>
                  {/* Google button */}
                  <button
                    onClick={handleGoogleAuth}
                    disabled={googleLoading}
                    className="w-full flex items-center justify-center gap-3 py-2.5 rounded-lg font-medium transition-colors
                               bg-white/90 border border-stone-300 text-stone-700
                               hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed mb-4"
                  >
                    <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
                      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="#4285F4"/>
                      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853"/>
                      <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.997 8.997 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" fill="#FBBC05"/>
                      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 6.29C4.672 4.163 6.656 2.58 9 3.58Z" fill="#EA4335"/>
                    </svg>
                    {googleLoading ? "Connecting..." : "Continue with Google"}
                  </button>

                  {/* Divider */}
                  <div className="mb-4">
                    <div className="w-full border-t border-white/30"></div>
                    <div className="text-center mt-2 text-sm text-white/90">
                      {mode === "login" ? "or sign in with email" : "or sign up with email"}
                    </div>
                  </div>

                  {/* Email/password form */}
                  <form onSubmit={handleSubmit}>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="Email"
                      className="w-full px-3 py-2.5 mb-3 rounded-lg text-sm
                                 bg-white/90 border border-stone-300 text-stone-800 placeholder-stone-400
                                 focus:outline-none focus:ring-2 focus:ring-[#da7b4a]/50 focus:border-transparent"
                    />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder={mode === "signup" ? "Password (min 6 chars)" : "Password"}
                      className="w-full px-3 py-2.5 mb-3 rounded-lg text-sm
                                 bg-white/90 border border-stone-300 text-stone-800 placeholder-stone-400
                                 focus:outline-none focus:ring-2 focus:ring-[#da7b4a]/50 focus:border-transparent"
                    />

                    {mode === "signup" && (
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        placeholder="Confirm password"
                        className="w-full px-3 py-2.5 mb-3 rounded-lg text-sm
                                   bg-white/90 border border-stone-300 text-stone-800 placeholder-stone-400
                                   focus:outline-none focus:ring-2 focus:ring-[#da7b4a]/50 focus:border-transparent"
                      />
                    )}

                    {mode === "login" && (
                      <button
                        type="button"
                        onClick={() => { setMode("forgot"); setError(null); setSuccess(null); setPassword(""); }}
                        className="block mb-3 text-xs text-white/70 hover:text-white/90 transition-colors"
                      >
                        Forgot your password?
                      </button>
                    )}

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-2.5 rounded-lg font-semibold transition-shadow
                                 bg-[#da7b4a] text-white
                                 hover:ring-2 hover:ring-white
                                 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading
                        ? (mode === "login" ? "Signing in..." : "Creating account...")
                        : (mode === "login" ? "Sign In" : "Create Account")}
                    </button>
                  </form>

                  {/* Toggle login/signup + back */}
                  <div className="flex items-center justify-between mt-3">
                    <button
                      onClick={toggleMode}
                      className="px-4 py-1.5 rounded-lg text-xs font-semibold transition-shadow
                                 bg-[#da7b4a] text-white hover:ring-2 hover:ring-white"
                    >
                      {mode === "login" ? "Create an account" : "Already have an account?"}
                    </button>
                    <button
                      onClick={() => { setShowAuth(false); setError(null); setSuccess(null); }}
                      className="px-4 py-1.5 rounded-lg text-xs font-semibold transition-shadow
                                 bg-[#da7b4a] text-white hover:ring-2 hover:ring-white"
                    >
                      Back
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
