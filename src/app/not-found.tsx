import Link from "next/link";
import { Compass, Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#080809] text-[#ededf0] flex items-center justify-center px-5">
      <div className="text-center max-w-md">
        <div
          className="text-[120px] font-black leading-none mb-4 select-none"
          style={{
            background: "linear-gradient(135deg, rgba(99,102,241,0.3) 0%, rgba(139,92,246,0.1) 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          404
        </div>
        <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mx-auto mb-5">
          <Compass className="h-7 w-7 text-indigo-400" />
        </div>
        <h1 className="text-2xl font-bold mb-3 tracking-tight">Page not found</h1>
        <p className="text-gray-400 text-sm leading-relaxed mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link href="/">
            <button className="h-10 px-5 text-sm font-semibold bg-white text-black hover:bg-gray-100 rounded-full transition-all hover:scale-105 active:scale-95 flex items-center gap-2">
              <Home className="h-4 w-4" /> Home
            </button>
          </Link>
          <Link href="/dashboard">
            <button className="h-10 px-5 text-sm font-medium text-gray-400 hover:text-gray-200 border border-white/[0.07] rounded-full transition-all flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" /> Dashboard
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
