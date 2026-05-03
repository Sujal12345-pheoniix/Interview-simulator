import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PlusCircle, Clock, CheckCircle2, History, BarChart3, Flame } from "lucide-react";
import getDb, { DatabaseConfigError } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";

export default async function DashboardPage() {
  const { userId: clerkId } = await auth();

  if (!clerkId) {
    return <div>Unauthorized</div>;
  }

  let user: any = null;
  let recentInterviews: any[] = [];
  let stats = {
    total: 0,
    completed: 0,
  };

  try {
    const sql = getDb();
    const users = await sql`SELECT * FROM users WHERE clerk_id = ${clerkId}`;

    if (users.length === 0) {
      return (
        <div className="min-h-screen bg-[#0c0c0e] flex items-center justify-center">
          <div className="text-center p-8">
            <div className="w-10 h-10 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-[#888] text-sm">Syncing your account... please refresh in a moment.</p>
          </div>
        </div>
      );
    }

    user = users[0];

    recentInterviews = await sql`
      SELECT * FROM interviews
      WHERE user_id = ${user.id}
      ORDER BY created_at DESC
      LIMIT 6
    `;

    const totalResult = await sql`SELECT COUNT(*) FROM interviews WHERE user_id = ${user.id}`;
    const completedResult = await sql`SELECT COUNT(*) FROM interviews WHERE user_id = ${user.id} AND status = 'completed'`;

    stats = {
      total: parseInt(totalResult[0].count),
      completed: parseInt(completedResult[0].count),
    };
  } catch (error: any) {
    const errorMessage = typeof error?.message === "string" ? error.message : "";
    const isDbConfigError =
      error instanceof DatabaseConfigError ||
      errorMessage.includes("DATABASE_URL");

    if (isDbConfigError) {
      return (
        <div className="min-h-screen bg-[#0c0c0e] flex items-center justify-center">
          <div className="max-w-lg w-full mx-auto px-6">
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-6">
              <h1 className="text-lg font-medium text-amber-300 mb-2">Database Not Configured</h1>
              <p className="text-amber-100/70 text-sm mb-4">
                Add your Neon DATABASE_URL in .env.local and restart the server.
              </p>
              <div className="rounded-lg bg-black/30 border border-white/10 p-3 text-xs text-gray-300 font-mono">
                DATABASE_URL=postgresql://...
              </div>
            </div>
          </div>
        </div>
      );
    }
    throw error;
  }

  const firstName = user.name?.split(" ")[0] || "there";
  const inProgress = stats.total - stats.completed;

  return (
    <div className="min-h-screen bg-[#0c0c0e] text-gray-100">
      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-[#0c0c0e]/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-5 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-indigo-400 font-semibold tracking-tight text-[15px]">InterviewSim</span>
          </div>
          <nav className="hidden md:flex items-center gap-1">
            <Link href="/dashboard" className="px-3 py-1.5 text-sm text-white/90 rounded-md bg-white/5">Dashboard</Link>
            <Link href="/interview/new" className="px-3 py-1.5 text-sm text-white/50 hover:text-white/80 transition-colors rounded-md hover:bg-white/5">New Interview</Link>
            <Link href="/analytics" className="px-3 py-1.5 text-sm text-white/50 hover:text-white/80 transition-colors rounded-md hover:bg-white/5">Analytics</Link>
          </nav>
          <Link href="/interview/new">
            <button className="h-8 px-4 text-sm bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors flex items-center gap-1.5">
              <PlusCircle className="h-3.5 w-3.5" />
              New
            </button>
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-5 pt-10 pb-20">
        {/* Welcome */}
        <div className="mb-10">
          <h1 className="text-2xl font-semibold mb-1">
            Hey {firstName} 👋
          </h1>
          <p className="text-[#666] text-sm">Here's what's been going on with your practice.</p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
          <div className="rounded-xl border border-white/[0.07] bg-[#111113] p-4">
            <div className="text-xs text-[#555] mb-2 uppercase tracking-wider">Total Sessions</div>
            <div className="text-3xl font-bold text-white">{stats.total}</div>
          </div>
          <div className="rounded-xl border border-white/[0.07] bg-[#111113] p-4">
            <div className="text-xs text-[#555] mb-2 uppercase tracking-wider">Completed</div>
            <div className="text-3xl font-bold text-emerald-400">{stats.completed}</div>
          </div>
          <div className="rounded-xl border border-white/[0.07] bg-[#111113] p-4">
            <div className="text-xs text-[#555] mb-2 uppercase tracking-wider">In Progress</div>
            <div className="text-3xl font-bold text-indigo-400">{inProgress}</div>
          </div>
          <div className="rounded-xl border border-white/[0.07] bg-[#111113] p-4">
            <div className="text-xs text-[#555] mb-2 uppercase tracking-wider">Streak</div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-bold text-orange-400">{Math.min(stats.completed, 7)}</span>
              <Flame className="h-4 w-4 text-orange-400 mb-0.5" />
            </div>
          </div>
        </div>

        {/* Quick actions */}
        <div className="grid md:grid-cols-3 gap-4 mb-12">
          <Link href="/interview/new" className="group rounded-xl border border-indigo-500/20 bg-indigo-500/5 hover:bg-indigo-500/10 p-5 transition-colors">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-sm font-medium text-indigo-300 mb-1">Start Interview</div>
                <div className="text-xs text-indigo-300/50">Technical, behavioral, or coding</div>
              </div>
              <PlusCircle className="h-5 w-5 text-indigo-400/60 group-hover:text-indigo-400 transition-colors" />
            </div>
          </Link>

          <Link href="/analytics" className="group rounded-xl border border-white/[0.07] bg-[#111113] hover:bg-[#161618] p-5 transition-colors">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-sm font-medium text-gray-200 mb-1">Analytics</div>
                <div className="text-xs text-[#555]">Track progress over time</div>
              </div>
              <BarChart3 className="h-5 w-5 text-[#444] group-hover:text-gray-400 transition-colors" />
            </div>
          </Link>

          <div className="rounded-xl border border-white/[0.07] bg-[#111113] p-5">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-sm font-medium text-gray-200 mb-1">Completion Rate</div>
                <div className="text-xs text-[#555]">{stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}% of all sessions</div>
              </div>
              <CheckCircle2 className="h-5 w-5 text-emerald-400/40" />
            </div>
            {stats.total > 0 && (
              <div className="mt-3 h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all"
                  style={{ width: `${Math.round((stats.completed / stats.total) * 100)}%` }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Recent activity */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium text-[#888] uppercase tracking-wider flex items-center gap-2">
              <Clock className="h-3.5 w-3.5" /> Recent Activity
            </h2>
          </div>

          {recentInterviews.length > 0 ? (
            <div className="space-y-2">
              {recentInterviews.map((interview) => (
                <div
                  key={interview.id}
                  className="flex items-center justify-between p-4 rounded-xl border border-white/[0.06] bg-[#111113] hover:bg-[#161618] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full shrink-0 ${
                      interview.status === "completed" ? "bg-emerald-500" :
                      interview.status === "in_progress" ? "bg-indigo-500" :
                      "bg-[#444]"
                    }`} />
                    <div>
                      <div className="text-sm font-medium capitalize">
                        {interview.role} <span className="text-[#555]">·</span> <span className="text-[#666] capitalize">{interview.type}</span>
                      </div>
                      <div className="text-xs text-[#444] mt-0.5">
                        <span className="capitalize">{interview.level}</span>
                        <span className="mx-1.5">·</span>
                        {new Date(interview.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                      </div>
                    </div>
                  </div>
                  <div>
                    {interview.status === "completed" ? (
                      <Link href={`/results/${interview.id}`}>
                        <button className="text-xs px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors border border-emerald-500/20">
                          View Results
                        </button>
                      </Link>
                    ) : (
                      <Link href={`/interview/${interview.id}`}>
                        <button className="text-xs px-3 py-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 transition-colors border border-indigo-500/20">
                          Continue
                        </button>
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 rounded-xl border border-white/[0.06] bg-[#111113]">
              <div className="text-[#444] text-4xl mb-3">○</div>
              <p className="text-[#555] text-sm mb-4">No interviews yet.</p>
              <Link href="/interview/new">
                <button className="text-sm px-4 py-2 rounded-lg bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600/30 transition-colors border border-indigo-500/20">
                  Start your first session
                </button>
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
