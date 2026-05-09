"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { RadarChart } from "@/components/charts/RadarChart";
import {
  ArrowLeft, CheckCircle2, AlertTriangle, Lightbulb,
  Loader2, ChevronRight, BarChart3, Trophy, RotateCcw
} from "lucide-react";
import Link from "next/link";

// ── Animated Score Ring ───────────────────────────────────────────────────────
function ScoreRing({ score }: { score: number }) {
  const [animated, setAnimated] = useState(false);
  useEffect(() => { const t = setTimeout(() => setAnimated(true), 200); return () => clearTimeout(t); }, []);

  const radius = 52;
  const circ = 2 * Math.PI * radius;
  const offset = animated ? circ - (score / 10) * circ : circ;
  const color = score >= 8 ? "#10b981" : score >= 6 ? "#f59e0b" : "#ef4444";
  const label = score >= 8 ? "Excellent" : score >= 6 ? "Good" : "Needs Work";

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-32 h-32">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r={radius} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
          <circle
            cx="60" cy="60" r={radius}
            fill="none" stroke={color} strokeWidth="8"
            strokeDasharray={circ} strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 1.4s cubic-bezier(0.16,1,0.3,1)", filter: `drop-shadow(0 0 8px ${color}50)` }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-black text-white" style={{ color }}>{score}</span>
          <span className="text-[10px] text-gray-500 font-medium">/ 10</span>
        </div>
      </div>
      <span className="text-xs font-semibold px-3 py-1 rounded-full" style={{ color, background: `${color}15`, border: `1px solid ${color}30` }}>
        {label}
      </span>
    </div>
  );
}

export default function ResultsPage() {
  const params = useParams();
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const id = params?.id;
    if (!id) return;
    fetch(`/api/results/${id}`)
      .then((r) => r.ok ? r.json() : Promise.reject())
      .then(setResult)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [params]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#080809] flex-col gap-3">
        <Loader2 className="h-7 w-7 animate-spin text-indigo-500" />
        <span className="text-gray-500 text-sm">Loading your results…</span>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#080809] text-gray-500 flex-col gap-4">
        <AlertTriangle className="h-8 w-8 text-amber-500" />
        <p>Result not found.</p>
        <Link href="/dashboard"><button className="text-sm px-4 py-2 rounded-lg bg-white/5 border border-white/8 text-gray-300 hover:bg-white/8 transition-colors">Back to Dashboard</button></Link>
      </div>
    );
  }

  const overallScore = Number(result.overall_score ?? result.overallScore ?? 0);
  const aiSummary = result.ai_summary ?? result.aiSummary ?? "";
  const categoryScores: Record<string, number> =
    typeof result.category_scores === "object" && result.category_scores !== null
      ? result.category_scores
      : typeof result.categoryScores === "object" && result.categoryScores !== null
      ? result.categoryScores
      : {};
  const strengths: string[] = Array.isArray(result.strengths) ? result.strengths : [];
  const weaknesses: string[] = Array.isArray(result.weaknesses) ? result.weaknesses : [];
  const recommendations: string[] = Array.isArray(result.recommendations) ? result.recommendations : [];
  const radarData = Object.entries(categoryScores).map(([category, score]) => ({ category, score: Number(score) }));

  const scoreColor = (s: number) => s >= 8 ? { bar: "bg-emerald-500", text: "text-emerald-400" } : s >= 6 ? { bar: "bg-amber-500", text: "text-amber-400" } : { bar: "bg-red-500", text: "text-red-400" };

  return (
    <div className="min-h-screen bg-[#080809] text-[#ededf0]">
      {/* Ambient */}
      <div className="fixed -top-[20%] left-[20%] w-[60%] h-[40%] rounded-full bg-indigo-600/5 blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-white/[0.05] bg-[#080809]/80 backdrop-blur-xl">
        <div className="max-w-5xl mx-auto px-5 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="flex items-center gap-1.5 text-gray-500 hover:text-gray-300 transition-colors text-sm">
              <ArrowLeft className="h-3.5 w-3.5" /> Dashboard
            </Link>
            <span className="text-gray-700">/</span>
            <span className="text-sm text-gray-300">Interview Report</span>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/analytics">
              <button className="h-8 px-3 text-xs font-medium text-gray-400 hover:text-gray-200 transition-colors rounded-lg hover:bg-white/5 flex items-center gap-1.5">
                <BarChart3 className="w-3.5 h-3.5" /> Analytics
              </button>
            </Link>
            <Link href="/interview/new">
              <button className="h-8 px-3 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-all flex items-center gap-1.5 shadow-lg shadow-indigo-600/20">
                <RotateCcw className="w-3 h-3" /> Practice Again
              </button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-5 pt-8 pb-24 space-y-5">

        {/* Hero score banner */}
        <div
          className="rounded-2xl border border-white/[0.06] bg-[#0e0e10] p-6 md:p-8 flex flex-col md:flex-row gap-6 items-start md:items-center"
          style={{ animation: "slide-up-fade 0.5s cubic-bezier(0.16,1,0.3,1) both" }}
        >
          <ScoreRing score={overallScore} />
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/5 border border-white/8 text-xs font-medium text-gray-400 mb-3">
              <Trophy className="w-3 h-3 text-amber-400" /> Performance Summary
            </div>
            <p className="text-gray-300 text-sm leading-relaxed max-w-xl">
              {aiSummary || "Your interview has been analyzed. Review the detailed breakdown below."}
            </p>
          </div>
        </div>

        {/* Main grid */}
        <div className="grid md:grid-cols-5 gap-4">
          {/* Radar */}
          <div className="md:col-span-2 rounded-2xl border border-white/[0.06] bg-[#0e0e10] p-5">
            <div className="text-xs text-gray-500 uppercase tracking-wider font-medium mb-4">Skill Breakdown</div>
            {radarData.length > 0 ? (
              <RadarChart data={radarData} />
            ) : (
              <div className="h-48 flex items-center justify-center text-gray-600 text-xs">Insufficient data</div>
            )}
          </div>

          {/* Strengths + Weaknesses */}
          <div className="md:col-span-3 space-y-3">
            <div className="rounded-2xl border border-white/[0.06] bg-[#0e0e10] p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                </div>
                <span className="text-sm font-semibold text-gray-200">Strengths</span>
              </div>
              {strengths.length > 0 ? (
                <ul className="space-y-2">
                  {strengths.map((str, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm">
                      <span className="w-5 h-5 rounded bg-emerald-500/10 flex items-center justify-center text-emerald-500 text-[10px] font-bold shrink-0 mt-0.5">{i + 1}</span>
                      <span className="text-gray-400 leading-relaxed">{str}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-600 text-xs">No strengths extracted.</p>
              )}
            </div>

            <div className="rounded-2xl border border-white/[0.06] bg-[#0e0e10] p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 rounded-lg bg-amber-500/10 flex items-center justify-center">
                  <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
                </div>
                <span className="text-sm font-semibold text-gray-200">Areas to Improve</span>
              </div>
              {weaknesses.length > 0 ? (
                <ul className="space-y-2">
                  {weaknesses.map((wk, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm">
                      <span className="w-5 h-5 rounded bg-amber-500/10 flex items-center justify-center text-amber-500 text-[10px] font-bold shrink-0 mt-0.5">{i + 1}</span>
                      <span className="text-gray-400 leading-relaxed">{wk}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-600 text-xs">No weaknesses identified.</p>
              )}
            </div>
          </div>
        </div>

        {/* Category scores */}
        {radarData.length > 0 && (
          <div className="rounded-2xl border border-white/[0.06] bg-[#0e0e10] p-5">
            <div className="text-xs text-gray-500 uppercase tracking-wider font-medium mb-4">Category Scores</div>
            <div className="grid sm:grid-cols-2 gap-4">
              {radarData.map(({ category, score }) => {
                const sc = scoreColor(score);
                return (
                  <div key={category}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs text-gray-400 font-medium capitalize">{category}</span>
                      <span className={`text-xs font-bold ${sc.text}`}>{score}/10</span>
                    </div>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${sc.bar} transition-all duration-700`} style={{ width: `${score * 10}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <div className="rounded-2xl border border-indigo-500/15 bg-indigo-500/5 p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                <Lightbulb className="h-3.5 w-3.5 text-indigo-400" />
              </div>
              <span className="text-sm font-semibold text-indigo-300">AI Coaching Plan</span>
            </div>
            <ul className="space-y-2.5">
              {recommendations.map((rec, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-indigo-100/70">
                  <span className="text-indigo-500 font-mono text-xs shrink-0 mt-0.5">0{i + 1}</span>
                  <span className="leading-relaxed">{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Top mistakes */}
        {weaknesses.slice(0, 3).length > 0 && (
          <div className="rounded-2xl border border-amber-500/15 bg-amber-500/5 p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
              </div>
              <span className="text-sm font-semibold text-amber-300">Fix These First</span>
            </div>
            <div className="grid sm:grid-cols-3 gap-3">
              {weaknesses.slice(0, 3).map((item, i) => (
                <div key={i} className="rounded-xl border border-amber-500/10 bg-amber-500/5 p-3">
                  <div className="text-[9px] uppercase tracking-widest text-amber-500/60 mb-1.5 font-bold">Priority {i + 1}</div>
                  <div className="text-xs text-amber-100/80 leading-relaxed">{item}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="flex items-center gap-3 pt-2">
          <Link href="/interview/new">
            <button className="h-10 px-6 text-sm font-semibold bg-white text-black hover:bg-gray-100 rounded-full transition-all hover:scale-105 active:scale-95 flex items-center gap-2 shadow-lg shadow-white/10">
              <RotateCcw className="h-4 w-4" /> Practice Again
            </button>
          </Link>
          <Link href="/analytics">
            <button className="h-10 px-5 text-sm font-medium text-gray-400 hover:text-gray-200 border border-white/[0.07] hover:border-white/12 rounded-full transition-all flex items-center gap-2">
              <BarChart3 className="h-4 w-4" /> View Analytics
            </button>
          </Link>
          <Link href="/dashboard">
            <button className="h-10 px-5 text-sm font-medium text-gray-500 hover:text-gray-300 rounded-full transition-colors flex items-center gap-2">
              <ChevronRight className="h-4 w-4" /> Dashboard
            </button>
          </Link>
        </div>
      </main>
    </div>
  );
}
