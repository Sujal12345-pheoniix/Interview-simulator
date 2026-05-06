"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Zap, Mail, Lock, User, ArrowRight, Loader2, AlertCircle } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Registration failed");
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-gray-100 flex flex-col items-center justify-center p-5 selection:bg-indigo-500/30">
      {/* Background Decor */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-600/10 blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-600/10 blur-[120px] pointer-events-none" />

      <Link href="/" className="mb-10 flex items-center gap-3 group transition-all">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition-transform">
          <Zap className="h-5 w-5 text-white" />
        </div>
        <span className="text-white font-bold tracking-tight text-xl">InterviewSim</span>
      </Link>

      <div className="w-full max-w-md bg-[#0a0a0c] border border-white/[0.04] rounded-[2.5rem] p-8 md:p-10 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-indigo-500 to-purple-500" />
        
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">Create Account</h1>
          <p className="text-gray-500 text-sm">Join the elite candidates and start practicing today.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2 ml-1">Full Name</label>
            <div className="relative group">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 group-focus-within:text-emerald-400 transition-colors" />
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full h-12 bg-white/[0.02] border border-white/[0.06] rounded-2xl pl-11 pr-4 text-sm focus:outline-none focus:border-emerald-500/50 focus:bg-white/[0.04] transition-all"
                placeholder="John Doe"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2 ml-1">Email Address</label>
            <div className="relative group">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 group-focus-within:text-emerald-400 transition-colors" />
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full h-12 bg-white/[0.02] border border-white/[0.06] rounded-2xl pl-11 pr-4 text-sm focus:outline-none focus:border-emerald-500/50 focus:bg-white/[0.04] transition-all"
                placeholder="name@example.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2 ml-1">Password</label>
            <div className="relative group">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 group-focus-within:text-emerald-400 transition-colors" />
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full h-12 bg-white/[0.02] border border-white/[0.06] rounded-2xl pl-11 pr-4 text-sm focus:outline-none focus:border-emerald-500/50 focus:bg-white/[0.04] transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-4 rounded-2xl bg-red-500/5 border border-red-500/10 text-red-400 text-xs animate-in fade-in slide-in-from-top-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 bg-white text-black rounded-2xl font-bold text-sm hover:bg-gray-200 transition-all flex items-center justify-center gap-2 mt-4 shadow-xl shadow-white/5 active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create Account"}
            {!loading && <ArrowRight className="h-4 w-4" />}
          </button>
        </form>

        <div className="mt-8 pt-8 border-t border-white/[0.04] text-center">
          <p className="text-gray-500 text-sm">
            Already have an account?{" "}
            <Link href="/login" className="text-white font-semibold hover:text-emerald-400 transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>

      <div className="mt-8 text-center">
        <Link href="/sign-up" className="text-xs text-gray-600 hover:text-gray-400 transition-colors">
          Prefer Clerk Authentication? Click here.
        </Link>
      </div>
    </div>
  );
}
