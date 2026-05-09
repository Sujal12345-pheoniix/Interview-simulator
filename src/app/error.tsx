"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";
import Link from "next/link";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("App error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#080809] text-[#ededf0] flex items-center justify-center px-5">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="h-8 w-8 text-red-400" />
        </div>
        <h1 className="text-2xl font-bold mb-3 tracking-tight">Something went wrong</h1>
        <p className="text-gray-400 text-sm leading-relaxed mb-8">
          {error?.message || "An unexpected error occurred. Please try again."}
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={reset}
            className="h-10 px-5 text-sm font-semibold bg-white text-black hover:bg-gray-100 rounded-full transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
          >
            <RotateCcw className="h-4 w-4" /> Try again
          </button>
          <Link href="/dashboard">
            <button className="h-10 px-5 text-sm font-medium text-gray-400 hover:text-gray-200 border border-white/[0.07] hover:border-white/12 rounded-full transition-all flex items-center gap-2">
              <Home className="h-4 w-4" /> Dashboard
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
