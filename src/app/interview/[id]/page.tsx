"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Timer } from "@/components/interview/Timer";
import { CameraProctor } from "@/components/interview/CameraProctor";
import { Loader2, AlertCircle, ChevronRight, Code2, MessageSquare, Brain, CheckCircle2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";

const CodeEditor = dynamic(
  () => import("@/components/interview/CodeEditor").then((m) => m.CodeEditor),
  { ssr: false, loading: () => <div className="h-64 bg-[#0a0a0c] rounded-xl border border-white/[0.06] flex items-center justify-center"><Loader2 className="h-5 w-5 animate-spin text-indigo-500" /></div> }
);

interface Question {
  id: string;
  text: string;
  category: string;
  difficulty: "easy" | "medium" | "hard";
}

interface Interview {
  id: string;
  type: "behavioral" | "technical" | "coding";
  role: string;
  level: string;
  questions: Question[];
  status: string;
}

const DIFF_STYLES: Record<string, string> = {
  easy:   "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  medium: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  hard:   "bg-red-500/10 text-red-400 border-red-500/20",
};

export default function InterviewRoomPage() {
  const params = useParams();
  const router = useRouter();
  const [interview, setInterview] = useState<Interview | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [code, setCode] = useState("// Write your solution here\n\n");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [timeWarning, setTimeWarning] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const id = params?.id as string;
    if (!id) return;
    fetch(`/api/interview/${id}`)
      .then((r) => r.ok ? r.json() : Promise.reject("not found"))
      .then((data) => {
        if (data.status === "completed") { router.replace(`/results/${id}`); return; }
        setInterview(data);
      })
      .catch(() => setError("Interview session not found."))
      .finally(() => setLoading(false));
  }, [params, router]);

  // Keyboard shortcut: Cmd/Ctrl+Enter to submit
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter" && !submitting && !completing) {
        handleSubmit();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  });

  const handleSubmit = useCallback(async () => {
    if (!interview) return;
    try {
      setSubmitting(true);
      const qId = interview.questions[currentIndex].id;
      const res = await fetch("/api/interview/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId: qId, userAnswer: answer, codeSubmission: interview.type === "coding" ? code : undefined }),
      });
      if (!res.ok) throw new Error("Evaluation failed");
      setTimeWarning(false);
      setAnswer("");
      setCode("// Write your solution here\n\n");
      if (currentIndex < interview.questions.length - 1) {
        setCurrentIndex((i) => i + 1);
      } else {
        await finishInterview();
      }
    } catch {
      alert("Error submitting. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }, [interview, currentIndex, answer, code]);

  const finishInterview = async () => {
    setCompleting(true);
    try {
      const res = await fetch("/api/interview/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ interviewId: interview!.id }),
      });
      if (!res.ok) throw new Error("Completion failed");
      router.push(`/results/${interview!.id}`);
    } catch {
      alert("Error generating report. Please try again.");
      setCompleting(false);
    }
  };

  // ── Loading ──
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#080809] flex-col gap-4">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 border-2 border-indigo-500/20 rounded-full animate-ping" />
          <div className="absolute inset-0 border-2 border-t-indigo-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin" />
        </div>
        <p className="text-gray-500 text-sm">Loading interview session…</p>
      </div>
    );
  }

  if (error || !interview || !interview.questions?.length) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#080809] flex-col gap-4">
        <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center">
          <AlertCircle className="h-6 w-6 text-red-400" />
        </div>
        <p className="text-gray-300 font-medium">{error || "Interview not found."}</p>
        <Link href="/dashboard">
          <button className="mt-2 text-sm px-5 py-2.5 rounded-xl bg-white/5 text-gray-300 hover:bg-white/8 border border-white/[0.07] transition-all">
            Back to Dashboard
          </button>
        </Link>
      </div>
    );
  }

  // ── Completing ──
  if (completing) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#080809] flex-col gap-6 text-center px-5">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 border-2 border-indigo-500/20 rounded-full animate-ping" />
          <Loader2 className="w-full h-full animate-spin text-indigo-500" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-white mb-2">Analyzing your performance…</h2>
          <p className="text-gray-400 text-sm max-w-sm">AI is evaluating your responses and generating a detailed feedback report.</p>
        </div>
      </div>
    );
  }

  const q = interview.questions[currentIndex];
  const progress = ((currentIndex + 1) / interview.questions.length) * 100;
  const canSubmit = interview.type === "coding" ? code.trim().length > 30 : answer.trim().length > 5;

  const TypeIcon = interview.type === "coding" ? Code2 : interview.type === "behavioral" ? MessageSquare : Brain;

  return (
    <div className="min-h-screen bg-[#080809] text-[#ededf0] flex flex-col">

      {/* Top bar */}
      <header className="sticky top-0 z-30 border-b border-white/[0.05] bg-[#080809]/90 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Link href="/dashboard" className="text-gray-600 hover:text-gray-300 transition-colors shrink-0">
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
                <TypeIcon className="w-3.5 h-3.5" />
              </div>
              <span className="text-sm font-semibold text-gray-200 capitalize truncate">{interview.role}</span>
              <span className="hidden sm:block text-gray-700">·</span>
              <span className="hidden sm:block text-xs text-gray-500 capitalize">{interview.type}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {timeWarning && (
              <span className="hidden sm:block text-xs text-amber-400 font-medium animate-pulse">Time&rsquo;s up!</span>
            )}
            <div className="text-xs text-gray-500 font-medium">
              {currentIndex + 1} / {interview.questions.length}
            </div>
            <Timer
              initialSeconds={interview.type === "coding" ? 45 * 60 : 5 * 60}
              onTimeUp={() => setTimeWarning(true)}
            />
          </div>
        </div>
        {/* Progress bar */}
        <div className="h-0.5 bg-white/5">
          <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
        {/* Question bubbles */}
        <div className="flex gap-1 px-4 py-2">
          {interview.questions.map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                i < currentIndex ? "bg-indigo-500" : i === currentIndex ? "bg-indigo-400" : "bg-white/[0.06]"
              }`}
            />
          ))}
        </div>
      </header>

      <main className="flex-1 flex flex-col lg:flex-row max-w-7xl mx-auto w-full gap-0 lg:gap-6 p-4 lg:p-6">

        {/* Left: Question */}
        <div className="w-full lg:w-[40%] lg:max-w-xl shrink-0">
          <div
            key={currentIndex}
            className="rounded-2xl border border-white/[0.06] bg-[#0e0e10] p-6 lg:p-7 h-full"
            style={{ animation: "slide-up-fade 0.4s cubic-bezier(0.16,1,0.3,1) both" }}
          >
            {/* Question meta */}
            <div className="flex items-center gap-2 mb-5">
              <span className="text-xs font-semibold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-1 rounded-lg">
                {q.category}
              </span>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg border ${DIFF_STYLES[q.difficulty] || ""}`}>
                {q.difficulty.toUpperCase()}
              </span>
            </div>

            {/* Question text */}
            <h2 className="text-lg md:text-xl font-medium leading-relaxed text-gray-100 mb-6">
              {q.text}
            </h2>

            {timeWarning && (
              <div className="rounded-xl border border-amber-500/20 bg-amber-500/8 p-3 text-xs text-amber-300 mb-4">
                ⏱ Time&rsquo;s up for this question. Submit your best answer to continue.
              </div>
            )}

            {/* Shortcuts hint */}
            <div className="mt-auto pt-4 border-t border-white/[0.04]">
              <p className="text-xs text-gray-600">
                Press <kbd className="px-1.5 py-0.5 rounded bg-white/5 border border-white/8 text-gray-400 font-mono text-[10px]">⌘ Enter</kbd> to submit
              </p>
            </div>
          </div>
        </div>

        {/* Right: Answer area */}
        <div className="flex-1 flex flex-col gap-4 mt-4 lg:mt-0">

          {/* Camera proctor (compact) */}
          <div className="flex justify-end">
            <CameraProctor />
          </div>

          {/* Answer input */}
          {interview.type === "coding" ? (
            <div className="flex-1 flex flex-col gap-3">
              <div className="rounded-xl overflow-hidden border border-white/[0.06]">
                <CodeEditor
                  language="javascript"
                  code={code}
                  onChange={(v) => setCode(v || "")}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1.5 font-medium">
                  Approach explanation & complexity analysis (optional)
                </label>
                <textarea
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  rows={3}
                  placeholder="Explain your approach, time & space complexity…"
                  className="w-full rounded-xl border border-white/[0.07] bg-[#0e0e10] px-4 py-3 text-sm text-gray-200 placeholder-gray-700 focus:outline-none focus:border-indigo-500/40 transition-colors resize-none"
                />
              </div>
            </div>
          ) : (
            <div className="flex-1">
              <textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder={
                  interview.type === "behavioral"
                    ? "Structure your answer using STAR (Situation, Task, Action, Result)…"
                    : "Explain your technical approach clearly. Cover edge cases and trade-offs…"
                }
                className="w-full h-full min-h-[280px] lg:min-h-[400px] rounded-2xl border border-white/[0.07] bg-[#0e0e10] px-5 py-4 text-sm text-gray-200 placeholder-gray-700 focus:outline-none focus:border-indigo-500/40 transition-colors resize-none leading-relaxed"
              />
            </div>
          )}

          {/* Submit button */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-600">
              {answer.length > 0 || (interview.type === "coding" && code.length > 30)
                ? <span className="text-emerald-500 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Ready to submit</span>
                : "Write your answer above"}
            </span>
            <button
              onClick={handleSubmit}
              disabled={submitting || !canSubmit}
              className="h-11 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold transition-all hover:scale-105 active:scale-95 flex items-center gap-2 shadow-lg shadow-indigo-600/20"
            >
              {submitting ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Evaluating…</>
              ) : currentIndex < interview.questions.length - 1 ? (
                <>Submit <ChevronRight className="h-4 w-4" /></>
              ) : (
                <>Finish Interview <CheckCircle2 className="h-4 w-4" /></>
              )}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
