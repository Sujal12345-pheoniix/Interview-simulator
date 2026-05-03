"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex h-screen flex-col items-center justify-center bg-[#030303] text-gray-100 p-6 text-center">
      <div className="bg-red-500/10 p-4 rounded-full mb-6 relative">
        <div className="absolute inset-0 border border-red-500/20 rounded-full animate-ping"></div>
        <AlertCircle className="h-10 w-10 text-red-500" />
      </div>
      <h2 className="text-3xl font-bold mb-4">Something went wrong!</h2>
      <p className="text-gray-400 max-w-md mb-8">
        We encountered an unexpected error while trying to process your request. Our systems have logged the issue.
      </p>
      <div className="flex gap-4">
        <Button
          onClick={() => reset()}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-8"
        >
          Try again
        </Button>
        <Link href="/dashboard">
          <Button variant="outline" className="border-white/10 text-gray-300 hover:bg-white/5 px-8">
            Go to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}
