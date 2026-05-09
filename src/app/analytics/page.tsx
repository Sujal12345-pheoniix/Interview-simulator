import Link from "next/link";
import { getAppAuth } from "@/lib/auth-wrapper";
import { redirect } from "next/navigation";
import getDb from "@/lib/db";
import { ScoreHistory } from "@/components/charts/ScoreHistory";
import { ArrowLeft, TrendingUp, TrendingDown, Trophy, Target, Zap, Radar, Minus, BarChart3 } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  const { userId: unifiedUserId, clerkId } = await getAppAuth();
  if (!unifiedUserId && !clerkId) redirect("/sign-in");

  const sql = getDb();
  let users: any[] = [];
  if (unifiedUserId) {
    users = await sql`SELECT * FROM users WHERE id = ${unifiedUserId}`;
  } else if (clerkId) {
    users = await sql`SELECT * FROM users WHERE clerk_id = ${clerkId}`;
  }

  if (users.length === 0) {
    return (
      <div className="min-h-screen bg-[#080809] flex items-center justify-center">
        <p className="text-gray-600 text-sm">Syncing account… please refresh.</p>
      </div>
    );
  }

  const user = users[0];
  const results = await sql`
    SELECT r.*, i.type, i.role, i.level FROM results r
    JOIN interviews i ON i.id = r.interview_id
    WHERE r.user_id = ${user.id}
    ORDER BY r.created_at ASC
  `;

  const scoreData = results.map((r: any) => ({
    date: new Date(r.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
    score: Number(r.overall_score),
  }));

  const avgScore = results.length > 0
    ? (results.reduce((a: number, r: any) => a + Number(r.overall_score), 0) / results.length).toFixed(1)
    : "0";
  const latestScore = results.length > 0 ? Number(results[results.length - 1].overall_score) : 0;
  const prevScore = results.length > 1 ? Number(results[results.length - 2].overall_score) : 0;
  const momentum = results.length > 1 ? Number((latestScore - prevScore).toFixed(1)) : 0;

  // Category aggregation
  const catTotals: Record<string, { total: number; count: number }> = {};
  for (const r of results as any[]) {
    const cats = typeof r.category_scores === "object" && r.category_scores ? r.category_scores : {};
    for (const [cat, score] of Object.entries(cats)) {
      if (!catTotals[cat]) catTotals[cat] = { total: 0, count: 0 };
      catTotals[cat].total += Number(score);
      catTotals[cat].count += 1;
    }
  }
  const categoryAvgs = Object.entries(catTotals)
    .map(([category, stats]) => ({ category, avg: Math.round((stats.total / stats.count) * 10) / 10 }))
    .sort((a, b) => b.avg - a.avg);
  const weakestCategory = [...categoryAvgs].sort((a, b) => a.avg - b.avg)[0];

  const latestRecs = results.length > 0 && Array.isArray(results[results.length - 1].recommendations)
    ? results[results.length - 1].recommendations.slice(0, 4)
    : [];

  // Type distribution
  const typeCounts = { behavioral: 0, technical: 0, coding: 0 };
  for (const r of results as any[]) {
    const t = r.type as keyof typeof typeCounts;
    if (t in typeCounts) typeCounts[t]++;
  }

  return (
    <div className="min-h-screen bg-[#080809] text-[#ededf0]">
      {/* Ambient */}
      <div className="fixed -top-[15%] right-[10%] w-[40%] h-[40%] rounded-full bg-indigo-600/6 blur-[100px] pointer-events-none" />

      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-white/[0.05] bg-[#080809]/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-5 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="flex items-center gap-1.5 text-gray-500 hover:text-gray-300 transition-colors text-sm">
              <ArrowLeft className="h-3.5 w-3.5" /> Dashboard
            </Link>
            <span className="text-gray-700">/</span>
            <span className="text-sm text-gray-300">Analytics</span>
          </div>
          <Link href="/interview/new">
            <button className="h-8 px-4 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-full transition-all flex items-center gap-1.5 shadow-lg shadow-indigo-600/20">
              <Zap className="w-3 h-3" /> New Interview
            </button>
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-5 pt-8 pb-24 space-y-6">

        {/* Page title */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight mb-1">Analytics</h1>
          <p className="text-gray-500 text-sm">Your performance trends across all completed interviews.</p>
        </div>

        {/* Stat row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            {
              label: "Sessions", value: results.length, icon: Target,
              color: "text-indigo-400", iconBg: "bg-indigo-500/10",
            },
            {
              label: "Avg Score", value: `${avgScore}/10`, icon: Trophy,
              color: "text-emerald-400", iconBg: "bg-emerald-500/10",
            },
            {
              label: "Momentum", icon: momentum >= 0 ? TrendingUp : TrendingDown,
              value: results.length > 1 ? `${momentum >= 0 ? "+" : ""}${momentum}` : "—",
              color: momentum >= 0 ? "text-emerald-400" : "text-red-400",
              iconBg: momentum >= 0 ? "bg-emerald-500/10" : "bg-red-500/10",
            },
            {
              label: "Focus Area", value: weakestCategory?.category || "—", icon: Radar,
              color: "text-amber-400", iconBg: "bg-amber-500/10",
              sub: weakestCategory ? `${weakestCategory.avg}/10 avg` : "more data needed",
            },
          ].map(({ label, value, icon: Icon, color, iconBg, sub }) => (
            <div key={label} className="rounded-2xl border border-white/[0.05] bg-[#0e0e10] p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-500 uppercase tracking-wider font-medium">{label}</span>
                <div className={`w-7 h-7 rounded-lg ${iconBg} flex items-center justify-center ${color}`}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className={`text-xl font-bold ${color} truncate`}>{value}</div>
              {sub && <p className="text-[10px] text-gray-600 mt-0.5">{sub}</p>}
            </div>
          ))}
        </div>

        {/* Score chart */}
        <div className="rounded-2xl border border-white/[0.05] bg-[#0e0e10] p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <div className="text-sm font-semibold text-gray-200 mb-0.5">Score History</div>
              <div className="text-xs text-gray-500">Overall score per completed interview session</div>
            </div>
            {results.length > 1 && (
              <div className={`flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${momentum >= 0 ? "text-emerald-400 bg-emerald-500/10" : "text-red-400 bg-red-500/10"}`}>
                {momentum >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                {momentum >= 0 ? "+" : ""}{momentum} pts
              </div>
            )}
          </div>
          {scoreData.length > 0 ? (
            <ScoreHistory data={scoreData} />
          ) : (
            <div className="h-48 flex flex-col items-center justify-center text-gray-600 text-sm gap-2">
              <BarChart3 className="w-8 h-8 opacity-30" />
              Complete more interviews to see your trend line.
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          {/* Category breakdown */}
          {categoryAvgs.length > 0 && (
            <div className="rounded-2xl border border-white/[0.05] bg-[#0e0e10] p-5">
              <div className="text-sm font-semibold text-gray-200 mb-1">Category Performance</div>
              <div className="text-xs text-gray-500 mb-5">Average score per topic area</div>
              <div className="space-y-3.5">
                {categoryAvgs.map(({ category, avg }) => {
                  const color = avg >= 8 ? { bar: "bg-emerald-500", text: "text-emerald-400" }
                    : avg >= 6 ? { bar: "bg-amber-500", text: "text-amber-400" }
                    : { bar: "bg-red-500", text: "text-red-400" };
                  return (
                    <div key={category}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-medium text-gray-400 capitalize">{category}</span>
                        <span className={`text-xs font-bold ${color.text}`}>{avg}/10</span>
                      </div>
                      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${color.bar} transition-all duration-700`} style={{ width: `${avg * 10}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Interview type distribution */}
          <div className="rounded-2xl border border-white/[0.05] bg-[#0e0e10] p-5">
            <div className="text-sm font-semibold text-gray-200 mb-1">Interview Mix</div>
            <div className="text-xs text-gray-500 mb-5">Breakdown by interview type</div>
            <div className="space-y-3.5">
              {[
                { label: "Technical", count: typeCounts.technical, color: "bg-indigo-500", text: "text-indigo-400" },
                { label: "Behavioral", count: typeCounts.behavioral, color: "bg-purple-500", text: "text-purple-400" },
                { label: "Coding / DSA", count: typeCounts.coding, color: "bg-cyan-500", text: "text-cyan-400" },
              ].map(({ label, count, color, text }) => {
                const pct = results.length > 0 ? Math.round((count / results.length) * 100) : 0;
                return (
                  <div key={label}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-medium text-gray-400">{label}</span>
                      <span className={`text-xs font-bold ${text}`}>{count} <span className="text-gray-600 font-normal">({pct}%)</span></span>
                    </div>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${color} transition-all duration-700`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>

            {results.length === 0 && (
              <div className="text-center py-6 text-gray-600 text-xs">No interviews completed yet.</div>
            )}
          </div>
        </div>

        {/* AI coaching */}
        {latestRecs.length > 0 && (
          <div className="rounded-2xl border border-indigo-500/15 bg-indigo-500/5 p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                <Zap className="h-3.5 w-3.5 text-indigo-400" />
              </div>
              <div>
                <div className="text-sm font-semibold text-indigo-200">Current Coaching Plan</div>
                <div className="text-xs text-indigo-400/60">Based on your last interview</div>
              </div>
            </div>
            <ul className="space-y-2.5">
              {latestRecs.map((item: string, idx: number) => (
                <li key={idx} className="flex items-start gap-3 text-sm text-indigo-100/70">
                  <span className="text-indigo-500 font-mono text-xs shrink-0 mt-0.5">0{idx + 1}</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}

        {results.length === 0 && (
          <div className="text-center py-20 rounded-2xl border border-dashed border-white/8 bg-white/[0.01]">
            <BarChart3 className="w-10 h-10 text-gray-600 mx-auto mb-4" />
            <h3 className="text-sm font-medium text-gray-400 mb-2">No completed interviews yet</h3>
            <p className="text-gray-600 text-xs mb-6">Complete at least one interview session to see your analytics.</p>
            <Link href="/interview/new">
              <button className="text-sm px-5 py-2.5 rounded-full bg-white text-black hover:bg-gray-100 font-semibold transition-all hover:scale-105 active:scale-95">
                Start your first session
              </button>
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
