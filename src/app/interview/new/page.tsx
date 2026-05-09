"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Loader2, Sparkles, ArrowLeft, ArrowRight,
  Code2, Brain, MessageSquare, User, Briefcase, Layers, ChevronRight
} from "lucide-react";
import Link from "next/link";

// ── Step types ────────────────────────────────────────────────────────────────
const ROLE_SUGGESTIONS = [
  { label: "Frontend Engineer", icon: Code2, color: "indigo" },
  { label: "Backend Engineer", icon: Layers, color: "cyan" },
  { label: "Full Stack Engineer", icon: Briefcase, color: "emerald" },
  { label: "Data Scientist", icon: Brain, color: "purple" },
  { label: "Product Manager", icon: User, color: "amber" },
  { label: "DevOps / SRE", icon: Layers, color: "rose" },
];

const COLOR_MAP: Record<string, { border: string; bg: string; text: string }> = {
  indigo:  { border: "border-indigo-500/40",  bg: "bg-indigo-500/10",  text: "text-indigo-400" },
  cyan:    { border: "border-cyan-500/40",    bg: "bg-cyan-500/10",    text: "text-cyan-400" },
  emerald: { border: "border-emerald-500/40", bg: "bg-emerald-500/10", text: "text-emerald-400" },
  purple:  { border: "border-purple-500/40",  bg: "bg-purple-500/10",  text: "text-purple-400" },
  amber:   { border: "border-amber-500/40",   bg: "bg-amber-500/10",   text: "text-amber-400" },
  rose:    { border: "border-rose-500/40",    bg: "bg-rose-500/10",    text: "text-rose-400" },
};

const TOTAL_STEPS = 4;

export default function NewInterviewPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ role: "", level: "mid", type: "technical", resume: "" });

  const canProceed = () => {
    if (step === 1) return form.role.trim().length > 0;
    return true;
  };

  const handleGenerate = async () => {
    try {
      setIsGenerating(true);
      setError("");
      const res = await fetch("/api/interview/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.details || data.error || "Failed to generate");
      }
      const data = await res.json();
      router.push(`/interview/${data.interviewId}`);
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
      setIsGenerating(false);
    }
  };

  const stepPercent = Math.round((step / TOTAL_STEPS) * 100);

  return (
    <div className="min-h-screen bg-[#080809] text-[#ededf0]">
      {/* Ambient */}
      <div className="fixed -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-indigo-600/6 blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-white/[0.05] bg-[#080809]/80 backdrop-blur-xl">
        <div className="max-w-5xl mx-auto px-5 h-14 flex items-center gap-3">
          <Link href="/dashboard" className="flex items-center gap-1.5 text-gray-500 hover:text-gray-300 transition-colors text-sm">
            <ArrowLeft className="h-3.5 w-3.5" />
            Dashboard
          </Link>
          <span className="text-gray-700">/</span>
          <span className="text-sm text-gray-300">New Interview</span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-5 pt-10 pb-24">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-500 font-medium">Step {step} of {TOTAL_STEPS}</span>
            <span className="text-xs text-gray-500">{stepPercent}%</span>
          </div>
          <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
              style={{ width: `${stepPercent}%` }}
            />
          </div>
          <div className="flex gap-1 mt-2">
            {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
              <div
                key={i}
                className={`flex-1 h-0.5 rounded-full transition-all duration-300 ${i < step ? "bg-indigo-500" : "bg-white/5"}`}
              />
            ))}
          </div>
        </div>

        {/* Step 1: Role */}
        {step === 1 && (
          <div style={{ animation: "slide-up-fade 0.4s cubic-bezier(0.16,1,0.3,1) both" }}>
            <div className="mb-7">
              <h1 className="text-2xl font-bold mb-1.5 tracking-tight">What role are you targeting?</h1>
              <p className="text-gray-400 text-sm">Pick a suggestion or type your own role below.</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-5">
              {ROLE_SUGGESTIONS.map(({ label, icon: Icon, color }) => {
                const c = COLOR_MAP[color];
                const selected = form.role === label;
                return (
                  <button
                    key={label}
                    onClick={() => setForm({ ...form, role: label })}
                    className={`flex items-center gap-2 p-3 rounded-xl border text-left transition-all text-sm font-medium ${
                      selected
                        ? `${c.border} ${c.bg} ${c.text}`
                        : "border-white/[0.06] bg-[#0e0e10] text-gray-400 hover:bg-[#131315] hover:border-white/10 hover:text-gray-200"
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    {label}
                  </button>
                );
              })}
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1.5 font-medium">Or type a custom role</label>
              <input
                type="text"
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                className="w-full h-11 rounded-xl border border-white/[0.07] bg-[#0e0e10] px-4 text-sm text-gray-100 placeholder-gray-700 focus:outline-none focus:border-indigo-500/50 transition-colors"
                placeholder="e.g. iOS Engineer, ML Engineer…"
              />
            </div>
          </div>
        )}

        {/* Step 2: Level + Type */}
        {step === 2 && (
          <div style={{ animation: "slide-up-fade 0.4s cubic-bezier(0.16,1,0.3,1) both" }}>
            <div className="mb-7">
              <h1 className="text-2xl font-bold mb-1.5 tracking-tight">Interview configuration</h1>
              <p className="text-gray-400 text-sm">Set your experience level and the type of interview.</p>
            </div>
            <div className="space-y-5">
              <div>
                <label className="block text-xs text-gray-500 mb-2 font-medium uppercase tracking-wider">Experience Level</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {["intern", "junior", "mid", "senior", "staff"].map((l) => (
                    <button
                      key={l}
                      onClick={() => setForm({ ...form, level: l })}
                      className={`py-2.5 px-4 rounded-xl border text-sm font-medium capitalize transition-all ${
                        form.level === l
                          ? "border-indigo-500/40 bg-indigo-500/10 text-indigo-300"
                          : "border-white/[0.06] bg-[#0e0e10] text-gray-400 hover:bg-[#131315] hover:text-gray-200"
                      }`}
                    >
                      {l === "staff" ? "Staff / Principal" : l}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-2 font-medium uppercase tracking-wider">Interview Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: "behavioral", label: "Behavioral", icon: MessageSquare },
                    { value: "technical",  label: "Technical",  icon: Brain },
                    { value: "coding",     label: "Coding / DSA", icon: Code2 },
                  ].map(({ value, label, icon: Icon }) => (
                    <button
                      key={value}
                      onClick={() => setForm({ ...form, type: value })}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl border text-sm font-medium transition-all ${
                        form.type === value
                          ? "border-indigo-500/40 bg-indigo-500/10 text-indigo-300"
                          : "border-white/[0.06] bg-[#0e0e10] text-gray-400 hover:bg-[#131315] hover:text-gray-200"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Resume */}
        {step === 3 && (
          <div style={{ animation: "slide-up-fade 0.4s cubic-bezier(0.16,1,0.3,1) both" }}>
            <div className="mb-7">
              <h1 className="text-2xl font-bold mb-1.5 tracking-tight">Add your resume</h1>
              <p className="text-gray-400 text-sm">
                Paste your resume text to get questions tailored to <em>your</em> stack, projects, and experience. Optional but highly recommended.
              </p>
            </div>
            <textarea
              value={form.resume}
              onChange={(e) => setForm({ ...form, resume: e.target.value })}
              rows={10}
              className="w-full rounded-xl border border-white/[0.07] bg-[#0e0e10] px-4 py-3 text-sm text-gray-200 placeholder-gray-700 focus:outline-none focus:border-indigo-500/50 transition-colors resize-none font-mono leading-relaxed"
              placeholder={"Paste your resume text here...\n\nTip: Copy from your PDF and paste. The AI will extract skills, projects, and tailor questions accordingly."}
            />
            <p className="text-xs text-gray-600 mt-2">{form.resume.length} characters</p>
          </div>
        )}

        {/* Step 4: Review */}
        {step === 4 && (
          <div style={{ animation: "slide-up-fade 0.4s cubic-bezier(0.16,1,0.3,1) both" }}>
            <div className="mb-7">
              <h1 className="text-2xl font-bold mb-1.5 tracking-tight">Ready to begin</h1>
              <p className="text-gray-400 text-sm">Review your setup and start when you're ready.</p>
            </div>
            <div className="rounded-2xl border border-white/[0.07] bg-[#0e0e10] divide-y divide-white/[0.05] mb-6">
              {[
                { label: "Role", value: form.role },
                { label: "Level", value: form.level === "staff" ? "Staff / Principal" : form.level.charAt(0).toUpperCase() + form.level.slice(1) },
                { label: "Type", value: form.type.charAt(0).toUpperCase() + form.type.slice(1) },
                { label: "Resume", value: form.resume ? `${form.resume.length} characters provided` : "Not provided — generic questions" },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between px-5 py-3.5">
                  <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">{label}</span>
                  <span className="text-sm text-gray-200 font-medium">{value}</span>
                </div>
              ))}
            </div>
            {error && (
              <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-400">
                {error}
              </div>
            )}
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full h-12 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold transition-all flex items-center justify-center gap-2 shadow-xl shadow-indigo-600/20 hover:scale-[1.02] active:scale-[0.98]"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating your interview…
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Generate Interview
                </>
              )}
            </button>
            <p className="text-center text-xs text-gray-600 mt-3">Takes ~10–15 seconds · Powered by Gemini 2.5</p>
          </div>
        )}

        {/* Navigation */}
        {step < 4 && (
          <div className="flex items-center justify-between mt-8">
            <button
              onClick={() => setStep((s) => Math.max(1, s - 1))}
              disabled={step === 1}
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-300 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
            <button
              onClick={() => setStep((s) => Math.min(TOTAL_STEPS, s + 1))}
              disabled={!canProceed()}
              className="flex items-center gap-2 h-10 px-6 rounded-xl bg-white text-black hover:bg-gray-100 text-sm font-semibold transition-all hover:scale-105 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {step === 3 ? "Review" : "Continue"}
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
