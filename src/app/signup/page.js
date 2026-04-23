"use client";

// Redirect stub — the landing page's inline auth panel handles signup.
// See src/app/login/page.js for the rationale.
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import FlightPathLoader from "@/components/FlightPathLoader";

export default function SignupRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/?auth=signup");
  }, [router]);
  return <FlightPathLoader text="Opening sign-up..." />;
}
