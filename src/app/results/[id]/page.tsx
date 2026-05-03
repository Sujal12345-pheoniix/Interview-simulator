"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { RadarChart } from "@/components/charts/RadarChart";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, CheckCircle2, AlertTriangle, Lightbulb, Loader2, TrendingUp, ChevronRight } from "lucide-react";
import Link from "next/link";

export default function ResultsPage() {
  const params = useParams();
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const id = params?.id;
        if (!id) return;

        const res = await fetch(`/api/results/${id}`);
        if (!res.ok) throw new Error("Failed to fetch result");

        const data = await res.json();
        setResult(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchResult();
  }, [params]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0c0c0e]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
          <span className="text-[#444] text-sm">Loading results...</span>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0c0c0e] text-[#555]">
        Result not found.
      </div>
    );
  }

  // Handle both PostgreSQL (snake_case) format
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

  const radarData = Object.keys(categoryScores).map((key) => ({
    category: key,
    score: categoryScores[key],
  }));

  const topMistakes = weaknesses.slice(0, 3);

  const getScoreLabel = (score: number) => {
    if (score >= 8) return { color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" };
    if (score >= 6) return { color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/20" };
    return { color: "text-red-400", bg: "bg-red-500/10 border-red-500/20" };
  };

  const scoreStyle = getScoreLabel(overallScore);

  return (
    <div className="min-h-screen bg-[#0c0c0e] text-gray-100">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-[#0c0c0e]/80 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-5 h-14 flex items-center gap-4">
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 text-[#555] hover:text-white/80 transition-colors text-sm"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Dashboard
          </Link>
          <span className="text-[#333]">/</span>
          <span className="text-sm text-gray-300">Interview Report</span>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-5 pt-8 pb-20 space-y-6">
        {/* Score banner */}
        <div className="rounded-xl border border-white/[0.06] bg-[#111113] p-6 flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
          <div className="flex-1">
            <div className="text-xs text-[#444] uppercase tracking-wider mb-2">Performance Summary</div>
            <p className="text-[#777] text-sm leading-relaxed max-w-xl">{aiSummary}</p>
          </div>
          <div className="shrink-0 flex flex-col items-center justify-center border border-white/[0.06] rounded-xl p-5 bg-[#0c0c0e] min-w-[120px]">
            <span className="text-xs text-[#444] uppercase tracking-wider mb-1">Score</span>
            <div className="flex items-baseline gap-1">
              <span className={`text-4xl font-bold ${scoreStyle.color}`}>{overallScore}</span>
              <span className="text-[#444] text-lg font-light">/ 10</span>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-5 gap-5">
          {/* Radar chart */}
          <div className="md:col-span-2 rounded-xl border border-white/[0.06] bg-[#111113] p-5">
            <div className="text-xs text-[#444] uppercase tracking-wider mb-4">Skill Breakdown</div>
            <RadarChart data={radarData} />
          </div>

          {/* Right column */}
          <div className="md:col-span-3 space-y-4">
            {/* Strengths */}
            <div className="rounded-xl border border-white/[0.06] bg-[#111113] p-5">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span className="text-sm font-medium text-gray-200">Strengths</span>
              </div>
              <ul className="space-y-2">
                {strengths.length > 0 ? (
                  strengths.map((str, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm">
                      <span className="w-5 h-5 rounded bg-white/[0.04] flex items-center justify-center text-[#555] text-xs shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <span className="text-[#888] leading-relaxed">{str}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-[#444] text-sm">No strengths extracted yet.</li>
                )}
              </ul>
            </div>

            {/* Weaknesses */}
            <div className="rounded-xl border border-white/[0.06] bg-[#111113] p-5">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                <span className="text-sm font-medium text-gray-200">Areas to Improve</span>
              </div>
              <ul className="space-y-2">
                {weaknesses.length > 0 ? (
                  weaknesses.map((wk, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm">
                      <span className="w-5 h-5 rounded bg-white/[0.04] flex items-center justify-center text-[#555] text-xs shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <span className="text-[#888] leading-relaxed">{wk}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-[#444] text-sm">No weaknesses extracted.</li>
                )}
              </ul>
            </div>
          </div>
        </div>

        {/* Category scores */}
        {radarData.length > 0 && (
          <div className="rounded-xl border border-white/[0.06] bg-[#111113] p-5">
            <div className="text-xs text-[#444] uppercase tracking-wider mb-4">Category Scores</div>
            <div className="grid md:grid-cols-2 gap-4">
              {radarData.map((item) => {
                const style = getScoreLabel(Number(item.score));
                return (
                  <div key={item.category}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm text-[#666] capitalize">{item.category}</span>
                      <span className={`text-xs rounded-full border px-2 py-0.5 ${style.bg} ${style.color}`}>
                        {item.score}/10
                      </span>
                    </div>
                    <div className="h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-500/60 rounded-full"
                        style={{ width: `${Number(item.score) * 10}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-5">
            <div className="flex items-center gap-2 mb-4">
              <Lightbulb className="h-4 w-4 text-indigo-400" />
              <span className="text-sm font-medium text-indigo-300">Recommendations</span>
            </div>
            <ul className="space-y-2">
              {recommendations.map((rec, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-indigo-100/70">
                  <ChevronRight className="h-4 w-4 text-indigo-400/60 shrink-0 mt-0.5" />
                  {rec}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Priority mistakes */}
        {topMistakes.length > 0 && (
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-5">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="h-4 w-4 text-amber-400" />
              <span className="text-sm font-medium text-amber-300">Fix These First</span>
            </div>
            <div className="space-y-2">
              {topMistakes.map((item, idx) => (
                <div key={idx} className="rounded-lg border border-amber-500/15 bg-amber-500/5 p-3">
                  <div className="text-[10px] uppercase tracking-widest text-amber-400/70 mb-1">
                    Priority {idx + 1}
                  </div>
                  <div className="text-sm text-amber-100/80">{item}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2">
          <Link href="/interview/new">
            <button className="h-10 px-5 text-sm bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors font-medium">
              Practice Again
            </button>
          </Link>
          <Link href="/dashboard">
            <button className="h-10 px-5 text-sm text-[#555] hover:text-white border border-white/[0.08] hover:border-white/20 rounded-lg transition-colors">
              Dashboard
            </button>
          </Link>
        </div>
      </main>
    </div>
  );
}
