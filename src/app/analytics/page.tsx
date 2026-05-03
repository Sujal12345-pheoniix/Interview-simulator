import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import getDb from "@/lib/db";
import { ScoreHistory } from "@/components/charts/ScoreHistory";
import Link from "next/link";
import { TrendingUp, Trophy, Target, Radar, ArrowLeft } from "lucide-react";

export default async function AnalyticsPage() {
  const { userId: clerkId } = await auth();

  if (!clerkId) {
    redirect("/sign-in");
  }

  const sql = getDb();
  const users = await sql`SELECT * FROM users WHERE clerk_id = ${clerkId}`;

  if (users.length === 0) {
    return (
      <div className="min-h-screen bg-[#0c0c0e] flex items-center justify-center">
        <p className="text-[#555] text-sm">Syncing account... please refresh.</p>
      </div>
    );
  }

  const user = users[0];

  const results = await sql`
    SELECT * FROM results
    WHERE user_id = ${user.id}
    ORDER BY created_at ASC
  `;

  const scoreData = results.map((r: any) => ({
    date: new Date(r.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
    score: Number(r.overall_score),
  }));

  const averageScore =
    results.length > 0
      ? (results.reduce((acc: number, r: any) => acc + Number(r.overall_score), 0) / results.length).toFixed(1)
      : "0";

  const latestScore = results.length > 0 ? Number(results[results.length - 1].overall_score) : 0;
  const previousScore = results.length > 1 ? Number(results[results.length - 2].overall_score) : 0;
  const momentum = results.length > 1 ? Number((latestScore - previousScore).toFixed(1)) : 0;

  const categoryTotals: Record<string, { total: number; count: number }> = {};
  for (const result of results as any[]) {
    const categories =
      typeof result.category_scores === "object" && result.category_scores !== null
        ? result.category_scores
        : {};

    for (const [category, score] of Object.entries(categories)) {
      if (!categoryTotals[category]) {
        categoryTotals[category] = { total: 0, count: 0 };
      }
      categoryTotals[category].total += Number(score);
      categoryTotals[category].count += 1;
    }
  }

  const weakestCategory = Object.entries(categoryTotals)
    .map(([category, stats]) => ({
      category,
      avg: Number((stats.total / Math.max(1, stats.count)).toFixed(1)),
    }))
    .sort((a, b) => a.avg - b.avg)[0];

  const latestRecommendations =
    results.length > 0 && Array.isArray(results[results.length - 1].recommendations)
      ? results[results.length - 1].recommendations.slice(0, 3)
      : [];

  return (
    <div className="min-h-screen bg-[#0c0c0e] text-gray-100">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-[#0c0c0e]/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-5 h-14 flex items-center gap-4">
          <Link href="/dashboard" className="flex items-center gap-1.5 text-[#555] hover:text-white/80 transition-colors text-sm">
            <ArrowLeft className="h-3.5 w-3.5" />
            Dashboard
          </Link>
          <span className="text-[#333]">/</span>
          <span className="text-sm text-gray-300">Analytics</span>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-5 pt-10 pb-20">
        <div className="mb-9">
          <h1 className="text-2xl font-semibold mb-1">Your Progress</h1>
          <p className="text-[#555] text-sm">Performance trends across all completed interviews.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          <div className="rounded-xl border border-white/[0.07] bg-[#111113] p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-[#555] uppercase tracking-wider">Sessions</span>
              <Target className="h-3.5 w-3.5 text-indigo-400/50" />
            </div>
            <div className="text-2xl font-bold">{results.length}</div>
          </div>

          <div className="rounded-xl border border-white/[0.07] bg-[#111113] p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-[#555] uppercase tracking-wider">Avg Score</span>
              <Trophy className="h-3.5 w-3.5 text-emerald-400/50" />
            </div>
            <div className="text-2xl font-bold">
              {averageScore}
              <span className="text-sm text-[#444] font-normal"> / 10</span>
            </div>
          </div>

          <div className="rounded-xl border border-white/[0.07] bg-[#111113] p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-[#555] uppercase tracking-wider">Momentum</span>
              <TrendingUp className="h-3.5 w-3.5 text-cyan-400/50" />
            </div>
            <div className={`text-2xl font-bold ${momentum >= 0 ? "text-emerald-400" : "text-red-400"}`}>
              {results.length > 1 ? `${momentum >= 0 ? "+" : ""}${momentum}` : "—"}
            </div>
            <p className="text-[10px] text-[#444] mt-0.5">vs prev session</p>
          </div>

          <div className="rounded-xl border border-white/[0.07] bg-[#111113] p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-[#555] uppercase tracking-wider">Focus Area</span>
              <Radar className="h-3.5 w-3.5 text-amber-400/50" />
            </div>
            <div className="text-sm font-medium capitalize text-gray-200">
              {weakestCategory ? weakestCategory.category : "—"}
            </div>
            <p className="text-[10px] text-[#444] mt-0.5">
              {weakestCategory ? `${weakestCategory.avg}/10 avg` : "needs more data"}
            </p>
          </div>
        </div>

        {/* Score chart */}
        <div className="rounded-xl border border-white/[0.07] bg-[#111113] p-5 mb-6">
          <div className="mb-4">
            <div className="text-sm font-medium text-gray-300 mb-0.5">Score History</div>
            <div className="text-xs text-[#555]">Overall score per completed interview</div>
          </div>
          {scoreData.length > 0 ? (
            <ScoreHistory data={scoreData} />
          ) : (
            <div className="h-48 flex items-center justify-center text-[#444] text-sm">
              Complete more interviews to see your trend line.
            </div>
          )}
        </div>

        {/* Coaching recommendations */}
        {latestRecommendations.length > 0 && (
          <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-5">
            <div className="text-sm font-medium text-indigo-300 mb-3">Current Coaching Plan</div>
            <ul className="space-y-2">
              {latestRecommendations.map((item: string, idx: number) => (
                <li key={idx} className="flex items-start gap-3 text-sm text-indigo-100/70">
                  <span className="mt-0.5 text-indigo-400 font-mono text-xs shrink-0">0{idx + 1}.</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}

        {results.length === 0 && (
          <div className="text-center py-16 rounded-xl border border-white/[0.06] bg-[#111113]">
            <p className="text-[#444] text-sm mb-4">No completed interviews yet.</p>
            <Link href="/interview/new">
              <button className="text-sm px-4 py-2 rounded-lg bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600/30 transition-colors border border-indigo-500/20">
                Start practicing
              </button>
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
