import Link from "next/link";
import { 
  PlusCircle, 
  Clock, 
  CheckCircle2, 
  Flame, 
  Trophy,
  Target,
  Zap,
  ChevronRight,
  Database,
  AlertCircle
} from "lucide-react";
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
    xp: 0,
    level: 1,
    streak: 0
  };
  let isDbConnected = true;

  try {
    const sql = getDb();
    const users = await sql`SELECT * FROM users WHERE clerk_id = ${clerkId}`;

    if (users.length === 0) {
      return (
        <div className="min-h-screen bg-[#050505] flex items-center justify-center">
          <div className="text-center p-8">
            <div className="w-10 h-10 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-[#888] text-sm animate-pulse">Syncing your account... please refresh in a moment.</p>
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

    const completed = parseInt(completedResult[0].count);
    
    stats = {
      total: parseInt(totalResult[0].count),
      completed: completed,
      xp: completed * 150 + (parseInt(totalResult[0].count) - completed) * 50,
      level: Math.floor((completed * 150) / 1000) + 1,
      streak: Math.min(completed, 7)
    };
  } catch (error: any) {
    isDbConnected = false;
    // Mock Data for Demo / Disconnected State
    user = { name: "Guest User" };
    stats = {
      total: 12,
      completed: 8,
      xp: 2450,
      level: 3,
      streak: 5
    };
    recentInterviews = [
      { id: '1', role: 'Frontend Developer', type: 'technical', level: 'senior', status: 'completed', created_at: new Date().toISOString() },
      { id: '2', role: 'Full Stack Engineer', type: 'behavioral', level: 'mid', status: 'completed', created_at: new Date(Date.now() - 86400000).toISOString() },
      { id: '3', role: 'System Design', type: 'technical', level: 'senior', status: 'in_progress', created_at: new Date(Date.now() - 172800000).toISOString() },
    ];
  }

  const firstName = user?.name?.split(" ")[0] || "there";
  const xpForNextLevel = stats.level * 1000;
  const progressPercent = Math.min(100, Math.round((stats.xp / xpForNextLevel) * 100));

  return (
    <div className="min-h-screen bg-[#050505] text-gray-100 overflow-x-hidden selection:bg-indigo-500/30">
      {/* Decorative Background Gradients */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-600/10 blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-600/10 blur-[120px] pointer-events-none" />

      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b border-white/[0.04] bg-[#050505]/60 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <span className="text-white font-bold tracking-tight text-[17px]">InterviewSim</span>
          </div>
          <nav className="hidden md:flex items-center gap-2">
            <Link href="/dashboard" className="px-4 py-2 text-sm font-medium text-white rounded-full bg-white/10 shadow-inner border border-white/5">Dashboard</Link>
            <Link href="/interview/new" className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white transition-all rounded-full hover:bg-white/5">New Interview</Link>
            <Link href="/analytics" className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white transition-all rounded-full hover:bg-white/5">Analytics</Link>
          </nav>
          <div className="flex items-center gap-3">
            {!isDbConnected && (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-medium">
                <Database className="w-3 h-3" />
                Preview Mode
              </div>
            )}
            <Link href="/interview/new">
              <button className="h-9 px-4 text-sm bg-white text-black hover:bg-gray-200 font-semibold rounded-full transition-all flex items-center gap-1.5 hover:scale-105 active:scale-95 shadow-lg shadow-white/10">
                <PlusCircle className="h-4 w-4" />
                <span className="hidden sm:inline">Start Practice</span>
              </button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-5 pt-8 pb-24 relative z-10">
        
        {!isDbConnected && (
          <div className="mb-8 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 flex items-start sm:items-center gap-4 animate-in slide-in-from-top-4 fade-in duration-500">
            <div className="p-2 bg-amber-500/10 rounded-full text-amber-400 shrink-0 mt-1 sm:mt-0">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-amber-300">Database Not Configured</h3>
              <p className="text-amber-200/70 text-xs sm:text-sm mt-0.5">
                You are viewing mock data. Add your Neon DATABASE_URL in .env.local to save your progress.
              </p>
            </div>
          </div>
        )}

        {/* Welcome & Level Banner */}
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6 animate-in slide-in-from-bottom-4 fade-in duration-700">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-indigo-300 mb-4 shadow-inner">
              <Trophy className="w-3.5 h-3.5 text-yellow-500" />
              Level {stats.level} Candidate
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2 tracking-tight">
              Welcome back, {firstName} <span className="inline-block animate-bounce origin-bottom">👋</span>
            </h1>
            <p className="text-gray-400 text-sm md:text-base max-w-xl">
              You're in the top 15% of active users this week. Keep up the momentum!
            </p>
          </div>

          <div className="w-full md:w-72 bg-[#111113] border border-white/[0.04] p-4 rounded-2xl shadow-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Experience</span>
              <span className="text-xs font-bold text-indigo-400">{stats.xp} / {xpForNextLevel} XP</span>
            </div>
            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden mb-2">
              <div 
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-1000 ease-out relative"
                style={{ width: `${progressPercent}%` }}
              >
                <div className="absolute top-0 right-0 bottom-0 w-10 bg-gradient-to-l from-white/30 to-transparent animate-pulse" />
              </div>
            </div>
            <p className="text-[10px] text-gray-500 text-right">{xpForNextLevel - stats.xp} XP to Level {stats.level + 1}</p>
          </div>
        </div>

        {/* Gamified Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12 animate-in slide-in-from-bottom-6 fade-in duration-700 delay-100">
          <div className="group rounded-2xl border border-white/[0.04] bg-[#0a0a0c] p-5 hover:bg-white/[0.02] transition-all hover:border-indigo-500/30 hover:shadow-lg hover:shadow-indigo-500/10 cursor-default">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                <Target className="w-4 h-4" />
              </div>
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">Sessions</div>
            </div>
            <div className="text-3xl font-bold text-white">{stats.total}</div>
          </div>
          
          <div className="group rounded-2xl border border-white/[0.04] bg-[#0a0a0c] p-5 hover:bg-white/[0.02] transition-all hover:border-emerald-500/30 hover:shadow-lg hover:shadow-emerald-500/10 cursor-default">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">Completed</div>
            </div>
            <div className="text-3xl font-bold text-white">{stats.completed}</div>
          </div>

          <div className="group rounded-2xl border border-white/[0.04] bg-[#0a0a0c] p-5 hover:bg-white/[0.02] transition-all hover:border-orange-500/30 hover:shadow-lg hover:shadow-orange-500/10 cursor-default">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-400 group-hover:scale-110 transition-transform">
                <Flame className="w-4 h-4" />
              </div>
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">Streak</div>
            </div>
            <div className="flex items-baseline gap-1.5">
              <div className="text-3xl font-bold text-white">{stats.streak}</div>
              <span className="text-xs text-orange-400 font-medium">Days</span>
            </div>
          </div>

          <div className="group rounded-2xl border border-white/[0.04] bg-[#0a0a0c] p-5 hover:bg-white/[0.02] transition-all hover:border-purple-500/30 hover:shadow-lg hover:shadow-purple-500/10 cursor-default flex flex-col justify-between">
            <div>
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Win Rate</div>
              <div className="text-2xl font-bold text-white mb-2">
                {stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%
              </div>
            </div>
            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
              <div 
                className="h-full bg-purple-500 rounded-full"
                style={{ width: `${stats.total > 0 ? (stats.completed / stats.total) * 100 : 0}%` }}
              />
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 animate-in slide-in-from-bottom-8 fade-in duration-700 delay-200">
          {/* Main Activity Area */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Clock className="h-5 w-5 text-indigo-400" /> 
                Recent Activity
              </h2>
              <Link href="/analytics" className="text-sm text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1 group">
                View all <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {recentInterviews.length > 0 ? (
              <div className="grid gap-4">
                {recentInterviews.map((interview, i) => (
                  <div
                    key={interview.id}
                    className="group relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-2xl border border-white/[0.04] bg-[#0a0a0c] hover:bg-[#111113] transition-all hover:border-white/10 hover:shadow-lg"
                    style={{ animationDelay: `${i * 100}ms` }}
                  >
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-indigo-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    
                    <div className="flex items-center gap-4 mb-4 sm:mb-0">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                        interview.status === "completed" ? "bg-emerald-500/10 text-emerald-400" :
                        "bg-indigo-500/10 text-indigo-400"
                      }`}>
                        {interview.status === "completed" ? <CheckCircle2 className="w-5 h-5" /> : <Zap className="w-5 h-5" />}
                      </div>
                      <div>
                        <h3 className="text-base font-semibold text-gray-100 capitalize mb-1">
                          {interview.role}
                        </h3>
                        <div className="flex items-center gap-2 text-xs font-medium">
                          <span className={`px-2 py-0.5 rounded-md ${
                            interview.type === "technical" ? "bg-blue-500/10 text-blue-400" : 
                            "bg-purple-500/10 text-purple-400"
                          }`}>
                            {interview.type}
                          </span>
                          <span className="text-gray-600">•</span>
                          <span className="text-gray-400 capitalize">{interview.level}</span>
                          <span className="text-gray-600">•</span>
                          <span className="text-gray-500">
                            {new Date(interview.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="shrink-0">
                      {interview.status === "completed" ? (
                        <Link href={`/results/${interview.id}`} className="w-full sm:w-auto">
                          <button className="w-full sm:w-auto text-sm px-5 py-2.5 rounded-xl bg-white/5 text-white hover:bg-white/10 hover:scale-105 active:scale-95 transition-all font-medium border border-white/5">
                            Review Details
                          </button>
                        </Link>
                      ) : (
                        <Link href={`/interview/${interview.id}`} className="w-full sm:w-auto">
                          <button className="w-full sm:w-auto text-sm px-5 py-2.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 hover:scale-105 active:scale-95 transition-all font-medium shadow-lg shadow-indigo-600/20">
                            Resume Session
                          </button>
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 rounded-3xl border border-dashed border-white/10 bg-white/[0.01]">
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Target className="w-8 h-8 text-gray-500" />
                </div>
                <h3 className="text-lg font-medium text-gray-300 mb-2">No interviews yet</h3>
                <p className="text-gray-500 text-sm mb-6 max-w-xs mx-auto">Your journey starts here. Take your first practice interview to begin earning XP.</p>
                <Link href="/interview/new">
                  <button className="text-sm px-6 py-3 rounded-full bg-white text-black hover:bg-gray-200 font-semibold transition-all hover:scale-105 active:scale-95 shadow-xl shadow-white/10">
                    Start First Session
                  </button>
                </Link>
              </div>
            )}
          </div>

          {/* Sidebar / Leaderboard / Badges */}
          <div className="space-y-6">
            <div className="rounded-3xl border border-white/[0.04] bg-gradient-to-b from-[#111113] to-[#0a0a0c] p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-3xl rounded-full pointer-events-none" />
              
              <h2 className="text-base font-semibold mb-6 flex items-center gap-2">
                <Trophy className="w-4 h-4 text-yellow-500" /> Achievements
              </h2>

              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center shrink-0 border border-yellow-500/20">
                    <Trophy className="w-5 h-5 text-yellow-500" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-200">First Steps</h4>
                    <p className="text-xs text-gray-500">Complete your first interview</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border ${stats.streak >= 3 ? 'bg-orange-500/10 border-orange-500/20' : 'bg-gray-800 border-gray-700'}`}>
                    <Flame className={`w-5 h-5 ${stats.streak >= 3 ? 'text-orange-500' : 'text-gray-600'}`} />
                  </div>
                  <div>
                    <h4 className={`text-sm font-medium ${stats.streak >= 3 ? 'text-gray-200' : 'text-gray-500'}`}>On Fire</h4>
                    <p className="text-xs text-gray-600">3 day streak {stats.streak >= 3 && '🔥'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border ${stats.level >= 5 ? 'bg-purple-500/10 border-purple-500/20' : 'bg-gray-800 border-gray-700'}`}>
                    <Zap className={`w-5 h-5 ${stats.level >= 5 ? 'text-purple-500' : 'text-gray-600'}`} />
                  </div>
                  <div>
                    <h4 className={`text-sm font-medium ${stats.level >= 5 ? 'text-gray-200' : 'text-gray-500'}`}>Expert Candidate</h4>
                    <p className="text-xs text-gray-600">Reach Level 5</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-indigo-500/20 bg-indigo-500/5 p-6 hover:bg-indigo-500/10 transition-colors cursor-pointer group">
              <h2 className="text-base font-semibold mb-2 text-indigo-300 group-hover:text-indigo-200 transition-colors">Daily Challenge</h2>
              <p className="text-sm text-indigo-300/70 mb-4">Complete a Behavioral Interview focusing on Leadership principles for +500 XP.</p>
              <Link href="/interview/new?type=behavioral">
                <button className="w-full py-2.5 rounded-xl bg-indigo-600 text-white font-medium text-sm hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/20 group-hover:scale-[1.02]">
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

