import Link from "next/link";
import {
  PlusCircle, Clock, CheckCircle2, Flame, Trophy,
  Target, Zap, ChevronRight, AlertCircle, TrendingUp, TrendingDown, Minus
} from "lucide-react";
import getDb, { DatabaseConfigError } from "@/lib/db";
import { getAppAuth } from "@/lib/auth-wrapper";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const { userId: unifiedUserId, clerkId } = await getAppAuth();

  if (!unifiedUserId && !clerkId) {
    redirect("/sign-in");
  }

  let user: any = null;
  let recentInterviews: any[] = [];
  let stats = { total: 0, completed: 0, xp: 0, level: 1, streak: 0, avgScore: 0, lastScore: 0, prevScore: 0 };
  let categoryScores: Record<string, number> = {};
  let weakTopics: Array<{ category: string; avg: number }> = [];
  let latestRecs: string[] = [];
  let isDbConnected = true;

  try {
    const sql = getDb();
    let users: any[] = [];

    if (unifiedUserId) {
      users = await sql`SELECT * FROM users WHERE id = ${unifiedUserId}`;
    } else if (clerkId) {
      users = await sql`SELECT * FROM users WHERE clerk_id = ${clerkId}`;
    }

    if (users.length === 0 && clerkId) {
      const clerkUser = await currentUser();
      if (clerkUser) {
        const email = clerkUser.emailAddresses[0]?.emailAddress || "";
        const name = [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") || "Unknown User";
        const avatar = clerkUser.imageUrl || "";
        users = await sql`
          INSERT INTO users (clerk_id, email, name, avatar)
          VALUES (${clerkId}, ${email}, ${name}, ${avatar})
          RETURNING *
        `;
      }
    }

    if (users.length === 0) {
      return (
        <div className="min-h-screen bg-[#080809] flex items-center justify-center">
          <div className="text-center p-8">
            <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-500 text-sm">Syncing account… refresh in a moment.</p>
          </div>
        </div>
      );
    }

    user = users[0];

    recentInterviews = await sql`
      SELECT * FROM interviews WHERE user_id = ${user.id}
      ORDER BY created_at DESC LIMIT 6
    `;

    const totalResult = await sql`SELECT COUNT(*) FROM interviews WHERE user_id = ${user.id}`;
    const completedResult = await sql`SELECT COUNT(*) FROM interviews WHERE user_id = ${user.id} AND status = 'completed'`;
    const completed = parseInt(completedResult[0].count);

    // Score history for momentum
    const results = await sql`
      SELECT overall_score, category_scores, recommendations, created_at
      FROM results WHERE user_id = ${user.id} ORDER BY created_at ASC
    `;

    const lastScore = results.length > 0 ? Number(results[results.length - 1].overall_score) : 0;
    const prevScore = results.length > 1 ? Number(results[results.length - 2].overall_score) : 0;
    const avgScore = results.length > 0
      ? results.reduce((a: number, r: any) => a + Number(r.overall_score), 0) / results.length
      : 0;

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
    categoryScores = Object.fromEntries(
      Object.entries(catTotals).map(([k, v]) => [k, Math.round((v.total / v.count) * 10) / 10])
    );
    weakTopics = Object.entries(categoryScores)
      .map(([category, avg]) => ({ category, avg }))
      .sort((a, b) => a.avg - b.avg)
      .slice(0, 3);

    if (results.length > 0) {
      const lastRecs = results[results.length - 1].recommendations;
      latestRecs = Array.isArray(lastRecs) ? lastRecs.slice(0, 3) : [];
    }

    stats = {
      total: parseInt(totalResult[0].count),
      completed,
      xp: completed * 150 + (parseInt(totalResult[0].count) - completed) * 50,
      level: Math.floor((completed * 150) / 1000) + 1,
      streak: Math.min(completed, 7),
      avgScore: Math.round(avgScore * 10) / 10,
      lastScore,
      prevScore,
    };
  } catch (error: any) {
    if (!(error instanceof DatabaseConfigError)) console.error("Dashboard error:", error);
    isDbConnected = false;
    user = { name: "Guest User" };
    stats = { total: 12, completed: 8, xp: 2450, level: 3, streak: 5, avgScore: 7.4, lastScore: 8.1, prevScore: 6.9 };
    recentInterviews = [
      { id: "1", role: "Frontend Developer", type: "technical", level: "senior", status: "completed", created_at: new Date().toISOString() },
      { id: "2", role: "Full Stack Engineer", type: "behavioral", level: "mid", status: "completed", created_at: new Date(Date.now() - 86400000).toISOString() },
      { id: "3", role: "System Design", type: "technical", level: "senior", status: "in_progress", created_at: new Date(Date.now() - 172800000).toISOString() },
    ];
    categoryScores = { "Algorithms": 7.2, "System Design": 5.8, "Behavioral": 8.5, "Concurrency": 6.1 };
    weakTopics = [
      { category: "System Design", avg: 5.8 },
      { category: "Concurrency", avg: 6.1 },
      { category: "Algorithms", avg: 7.2 },
    ];
    latestRecs = [
      "Practice 2 LeetCode hard problems daily focusing on graph traversal",
      "Study distributed systems design patterns (CAP theorem, consistent hashing)",
      "Record yourself answering behavioral questions and review clarity",
    ];
  }

  const firstName = user?.name?.split(" ")[0] || "there";
  const xpForNextLevel = stats.level * 1000;
  const progressPercent = Math.min(100, Math.round((stats.xp % 1000) / 10));
  const momentum = stats.lastScore - stats.prevScore;
  const winRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  return (
    <div className="min-h-screen bg-[#080809] text-[#ededf0] overflow-x-hidden">
      {/* Ambient */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-600/7 blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-600/6 blur-[100px] pointer-events-none" />

      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-white/[0.05] bg-[#080809]/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-5 h-14 flex items-center justify-between">
          <div className="flex items-center gap-5">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition-transform">
                <Zap className="h-3.5 w-3.5 text-white" />
              </div>
              <span className="text-white font-bold tracking-tight text-sm hidden sm:block">InterviewSim</span>
            </Link>
            <nav className="hidden md:flex items-center gap-1">
              <Link href="/dashboard" className="px-3 py-1.5 text-sm font-medium text-white rounded-lg bg-white/8 border border-white/8">Dashboard</Link>
              <Link href="/interview/new" className="px-3 py-1.5 text-sm font-medium text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/5">New Interview</Link>
              <Link href="/analytics" className="px-3 py-1.5 text-sm font-medium text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/5">Analytics</Link>
            </nav>
          </div>
          <div className="flex items-center gap-2">
            {!isDbConnected && (
              <span className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-medium">
                <AlertCircle className="w-3 h-3" /> Preview
              </span>
            )}
            <Link href="/interview/new">
              <button className="h-8 px-4 text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-full transition-all flex items-center gap-1.5 hover:scale-105 active:scale-95 shadow-lg shadow-indigo-600/20">
                <PlusCircle className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">New Interview</span>
              </button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-5 pt-8 pb-24 relative z-10">

        {/* Preview banner */}
        {!isDbConnected && (
          <div className="mb-6 rounded-xl border border-amber-500/15 bg-amber-500/5 p-4 flex items-center gap-3">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
            <p className="text-amber-200/70 text-xs">
              <span className="font-medium text-amber-300">Preview mode — </span>
              Add your Neon DATABASE_URL to .env.local to save real progress.
            </p>
          </div>
        )}

        {/* Welcome header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/8 text-xs font-medium text-indigo-300 mb-3">
              <Trophy className="w-3 h-3 text-amber-400" />
              Level {stats.level} · {stats.xp} XP earned
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-1">
              Welcome back, {firstName} 👋
            </h1>
            <p className="text-gray-400 text-sm">
              {stats.completed > 0
                ? `You've completed ${stats.completed} interview${stats.completed > 1 ? "s" : ""}. Keep the momentum going.`
                : "Your journey starts here. Take your first interview to earn XP."}
            </p>
          </div>

          {/* XP progress */}
          <div className="w-full md:w-64 bg-[#0e0e10] border border-white/[0.05] p-4 rounded-2xl shrink-0">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Level {stats.level}</span>
              <span className="text-xs font-bold text-indigo-400">{stats.xp % 1000} / 1000 XP</span>
            </div>
            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden mb-1.5">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full relative transition-all duration-1000"
                style={{ width: `${progressPercent}%` }}
              >
                <div className="absolute top-0 right-0 bottom-0 w-6 bg-gradient-to-l from-white/30 to-transparent animate-pulse" />
              </div>
            </div>
            <p className="text-[10px] text-gray-600 text-right">{1000 - (stats.xp % 1000)} XP to Level {stats.level + 1}</p>
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {[
            {
              label: "Sessions", value: stats.total, icon: Target,
              color: "text-indigo-400", bg: "bg-indigo-500/8", border: "hover:border-indigo-500/25",
            },
            {
              label: "Completed", value: stats.completed, icon: CheckCircle2,
              color: "text-emerald-400", bg: "bg-emerald-500/8", border: "hover:border-emerald-500/25",
            },
            {
              label: "Streak", value: `${stats.streak}d`, icon: Flame,
              color: "text-orange-400", bg: "bg-orange-500/8", border: "hover:border-orange-500/25",
            },
            {
              label: "Avg Score", value: stats.avgScore > 0 ? `${stats.avgScore}/10` : "—", icon: TrendingUp,
              color: "text-purple-400", bg: "bg-purple-500/8", border: "hover:border-purple-500/25",
            },
          ].map(({ label, value, icon: Icon, color, bg, border }) => (
            <div key={label} className={`group rounded-2xl border border-white/[0.05] bg-[#0e0e10] p-5 hover:bg-[#131315] transition-all ${border} cursor-default`}>
              <div className="flex items-center gap-2 mb-3">
                <div className={`w-7 h-7 rounded-lg ${bg} flex items-center justify-center ${color} group-hover:scale-110 transition-transform`}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">{label}</span>
              </div>
              <div className="text-2xl font-bold text-white">{value}</div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main: recent interviews */}
          <div className="lg:col-span-2 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold flex items-center gap-2 text-gray-200">
                <Clock className="h-4 w-4 text-gray-400" /> Recent Activity
              </h2>
              <Link href="/analytics" className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1 group">
                View analytics <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>

            {recentInterviews.length > 0 ? (
              <div className="space-y-2">
                {recentInterviews.map((iv: any, i: number) => (
                  <div
                    key={iv.id}
                    className="group relative flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-white/[0.05] bg-[#0e0e10] hover:bg-[#131315] hover:border-white/[0.09] transition-all"
                    style={{ animationDelay: `${i * 60}ms` }}
                  >
                    <div className="absolute left-0 top-3 bottom-3 w-0.5 bg-gradient-to-b from-indigo-500 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="flex items-center gap-3 mb-3 sm:mb-0">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${iv.status === "completed" ? "bg-emerald-500/10 text-emerald-400" : "bg-indigo-500/10 text-indigo-400"}`}>
                        {iv.status === "completed" ? <CheckCircle2 className="w-4 h-4" /> : <Zap className="w-4 h-4" />}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-gray-100 capitalize">{iv.role}</div>
                        <div className="flex items-center gap-2 text-xs mt-0.5">
                          <span className={`px-1.5 py-0.5 rounded ${iv.type === "technical" ? "bg-blue-500/10 text-blue-400" : iv.type === "coding" ? "bg-cyan-500/10 text-cyan-400" : "bg-purple-500/10 text-purple-400"}`}>
                            {iv.type}
                          </span>
                          <span className="text-gray-600">·</span>
                          <span className="text-gray-500 capitalize">{iv.level}</span>
                          <span className="text-gray-600">·</span>
                          <span className="text-gray-600">{new Date(iv.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</span>
                        </div>
                      </div>
                    </div>
                    <div className="shrink-0 pl-12 sm:pl-0">
                      {iv.status === "completed" ? (
                        <Link href={`/results/${iv.id}`}>
                          <button className="text-xs px-4 py-2 rounded-lg bg-white/5 text-gray-300 hover:bg-white/8 hover:text-white transition-all font-medium border border-white/[0.06]">
                            View Results
                          </button>
                        </Link>
                      ) : (
                        <Link href={`/interview/${iv.id}`}>
                          <button className="text-xs px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 transition-all font-medium shadow-lg shadow-indigo-600/20">
                            Resume
                          </button>
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 rounded-2xl border border-dashed border-white/8 bg-white/[0.01]">
                <div className="w-14 h-14 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Target className="w-7 h-7 text-gray-600" />
                </div>
                <h3 className="text-sm font-medium text-gray-300 mb-1">No sessions yet</h3>
                <p className="text-gray-500 text-xs mb-5 max-w-xs mx-auto">Start your first interview to begin earning XP and tracking progress.</p>
                <Link href="/interview/new">
                  <button className="text-sm px-5 py-2.5 rounded-full bg-white text-black hover:bg-gray-100 font-semibold transition-all hover:scale-105 active:scale-95 shadow-lg">
                    Start first session
                  </button>
                </Link>
              </div>
            )}

            {/* Momentum indicator */}
            {stats.completed >= 2 && (
              <div className="flex items-center gap-3 p-4 rounded-xl border border-white/[0.05] bg-[#0e0e10]">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${momentum >= 0 ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}`}>
                  {momentum > 0 ? <TrendingUp className="w-4 h-4" /> : momentum < 0 ? <TrendingDown className="w-4 h-4" /> : <Minus className="w-4 h-4" />}
                </div>
                <div>
                  <div className="text-xs font-medium text-gray-300">
                    Score momentum: <span className={momentum >= 0 ? "text-emerald-400" : "text-red-400"}>{momentum >= 0 ? "+" : ""}{momentum.toFixed(1)} pts</span> vs last session
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">Win rate: {winRate}% · {stats.completed} completed</div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Weak topics */}
            {weakTopics.length > 0 && (
              <div className="rounded-2xl border border-white/[0.05] bg-[#0e0e10] p-5">
                <h2 className="text-xs font-semibold mb-4 text-gray-300 uppercase tracking-wider flex items-center gap-2">
                  <Target className="w-3.5 h-3.5 text-amber-400" /> Focus Areas
                </h2>
                <div className="space-y-3">
                  {weakTopics.map(({ category, avg }) => (
                    <div key={category}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-400 font-medium capitalize">{category}</span>
                        <span className={`text-xs font-bold ${avg < 6 ? "text-red-400" : avg < 7.5 ? "text-amber-400" : "text-emerald-400"}`}>{avg}/10</span>
                      </div>
                      <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${avg < 6 ? "bg-red-500" : avg < 7.5 ? "bg-amber-500" : "bg-emerald-500"}`}
                          style={{ width: `${avg * 10}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* AI Recommendations */}
            {latestRecs.length > 0 && (
              <div className="rounded-2xl border border-indigo-500/15 bg-indigo-500/5 p-5">
                <h2 className="text-xs font-semibold mb-4 text-indigo-300 uppercase tracking-wider flex items-center gap-2">
                  <Zap className="w-3.5 h-3.5" /> AI Coaching
                </h2>
                <ul className="space-y-3">
                  {latestRecs.map((rec, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-xs text-indigo-100/70 leading-relaxed">
                      <span className="text-indigo-500 font-mono shrink-0 mt-0.5">0{i + 1}</span>
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Daily challenge */}
            <div className="rounded-2xl border border-white/[0.05] bg-[#0e0e10] p-5">
              <h2 className="text-xs font-semibold mb-2 text-gray-300 uppercase tracking-wider flex items-center gap-2">
                <Flame className="w-3.5 h-3.5 text-orange-400" /> Daily Challenge
              </h2>
              <p className="text-xs text-gray-500 mb-4 leading-relaxed">
                Complete a System Design interview today for <span className="text-amber-400 font-semibold">+500 bonus XP</span>.
              </p>
              <Link href="/interview/new?type=technical">
                <button className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium text-xs hover:opacity-90 transition-opacity shadow-lg shadow-indigo-600/20">
                  Accept Challenge
                </button>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
