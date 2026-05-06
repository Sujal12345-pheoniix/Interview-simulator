import Link from "next/link";
import { ArrowRight, Code2, Brain, BarChart3, LogIn, Trophy, Target, Zap, Rocket, CheckCircle2, Mail } from "lucide-react";
import { getAppAuth } from "@/lib/auth-wrapper";

export default async function LandingPage() {
  const { userId } = await getAppAuth();

  return (
    <div className="min-h-screen bg-[#050505] text-gray-100 overflow-x-hidden selection:bg-indigo-500/30">
      
      {/* Decorative Background Effects */}
      <div className="fixed top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-600/10 blur-[150px] pointer-events-none" />
      <div className="fixed bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-600/10 blur-[150px] pointer-events-none" />
      <div className="absolute top-[30%] left-[50%] translate-x-[-50%] w-[80%] h-[30%] rounded-full bg-purple-600/5 blur-[120px] pointer-events-none" />

      {/* Nav */}
      <nav className="fixed top-0 w-full border-b border-white/[0.04] bg-[#050505]/60 backdrop-blur-xl z-50 transition-all">
        <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition-transform">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <span className="text-white font-bold tracking-tight text-[17px]">InterviewSim</span>
          </div>
          <div className="flex items-center gap-3">
            {userId ? (
              <Link href="/dashboard">
                <button className="h-9 px-5 text-sm font-semibold bg-white text-black hover:bg-gray-200 rounded-full transition-all shadow-lg shadow-white/10 hover:scale-105 active:scale-95">
                  Go to Dashboard
                </button>
              </Link>
            ) : (
              <>
                <Link href="/sign-in" className="hidden sm:block">
                  <button className="h-9 px-4 text-sm font-medium text-gray-400 hover:text-white transition-colors flex items-center gap-1.5 rounded-full hover:bg-white/5">
                    <LogIn className="h-3.5 w-3.5" />
                    Sign in
                  </button>
                </Link>
                <Link href="/login" className="hidden sm:block">
                  <button className="h-9 px-4 text-sm font-medium text-gray-400 hover:text-white transition-colors flex items-center gap-1.5 rounded-full hover:bg-white/5 border border-white/5">
                    <Mail className="h-3.5 w-3.5" />
                    Email Login
                  </button>
                </Link>
                <Link href="/sign-up">
                  <button className="h-9 px-5 text-sm font-semibold bg-white text-black hover:bg-gray-200 rounded-full transition-all shadow-lg shadow-white/10 hover:scale-105 active:scale-95">
                    Start Playing Free
                  </button>
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative max-w-6xl mx-auto px-5 pt-40 pb-20 md:pt-48 md:pb-32 flex flex-col items-center text-center z-10">
        
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs font-semibold text-indigo-300 mb-8 animate-in slide-in-from-bottom-4 fade-in duration-700 shadow-[0_0_20px_rgba(99,102,241,0.15)]">
          <Trophy className="w-3.5 h-3.5 text-yellow-500" />
          Level Up Your Tech Career
        </div>

        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[1.05] mb-8 max-w-4xl animate-in slide-in-from-bottom-6 fade-in duration-700 delay-100">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200 to-gray-500">
            Conquer Interviews.
          </span>
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-emerald-400">
            Earn the Offer.
          </span>
        </h1>

        <p className="text-gray-400 text-lg md:text-xl max-w-2xl leading-relaxed mb-12 animate-in slide-in-from-bottom-8 fade-in duration-700 delay-200 font-medium">
          Treat your interview prep like a game. Complete interactive challenges, gain XP, master coding problems, and confidently beat the final boss: <span className="text-white">The Hiring Manager</span>.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 animate-in slide-in-from-bottom-10 fade-in duration-700 delay-300">
          <Link href={userId ? "/dashboard" : "/sign-up"}>
            <button className="h-14 px-8 text-base font-bold bg-white text-black hover:bg-gray-200 rounded-full transition-all flex items-center gap-2 shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:shadow-[0_0_40px_rgba(255,255,255,0.3)] hover:scale-105 active:scale-95 group">
              Start Your Quest
              <Rocket className="h-5 w-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </button>
          </Link>
          <Link href={userId ? "/interview/new" : "/sign-in"}>
            <button className="h-14 px-8 text-base font-semibold text-white bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 rounded-full transition-all hover:scale-105 active:scale-95 flex items-center gap-2">
              <Zap className="h-4 w-4 text-yellow-500" /> Play Demo
            </button>
          </Link>
        </div>

        {/* Floating Gamified Stats Preview */}
        <div className="mt-20 w-full max-w-3xl grid grid-cols-2 md:grid-cols-4 gap-4 animate-in fade-in duration-1000 delay-500">
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05] flex flex-col items-center justify-center gap-2 hover:bg-white/[0.04] transition-colors cursor-default">
            <Target className="w-6 h-6 text-indigo-400" />
            <span className="text-2xl font-bold text-white">100+</span>
            <span className="text-[10px] uppercase tracking-wider text-gray-500 font-medium">Challenges</span>
          </div>
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05] flex flex-col items-center justify-center gap-2 hover:bg-white/[0.04] transition-colors cursor-default">
            <CheckCircle2 className="w-6 h-6 text-emerald-400" />
            <span className="text-2xl font-bold text-white">95%</span>
            <span className="text-[10px] uppercase tracking-wider text-gray-500 font-medium">Win Rate</span>
          </div>
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05] flex flex-col items-center justify-center gap-2 hover:bg-white/[0.04] transition-colors cursor-default">
            <Trophy className="w-6 h-6 text-yellow-500" />
            <span className="text-2xl font-bold text-white">Top 1%</span>
            <span className="text-[10px] uppercase tracking-wider text-gray-500 font-medium">Leaderboard</span>
          </div>
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05] flex flex-col items-center justify-center gap-2 hover:bg-white/[0.04] transition-colors cursor-default">
            <Zap className="w-6 h-6 text-purple-400" />
            <span className="text-2xl font-bold text-white">Real</span>
            <span className="text-[10px] uppercase tracking-wider text-gray-500 font-medium">Environments</span>
          </div>
        </div>
      </section>

      {/* Features Grid / Quest Log */}
      <section className="relative z-10 max-w-6xl mx-auto px-5 py-24 border-t border-white/[0.04]">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-indigo-400 uppercase tracking-widest mb-4">
            <Trophy className="w-4 h-4" /> Your Arsenal
          </div>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight">Everything to dominate the interview.</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Feature Card 1 */}
          <div className="group p-8 rounded-3xl border border-white/[0.04] bg-[#0a0a0c] hover:bg-[#111113] transition-all hover:border-indigo-500/30 hover:shadow-2xl hover:shadow-indigo-500/10 cursor-default relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-3xl rounded-full group-hover:bg-indigo-500/20 transition-colors pointer-events-none" />
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform">
              <Code2 className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-white">Live Code Arena</h3>
            <p className="text-gray-400 text-sm leading-relaxed font-medium">
              Battle-test your skills in a fully integrated Monaco code editor. Solve algorithmic puzzles under time pressure, just like the real deal.
            </p>
          </div>

          {/* Feature Card 2 */}
          <div className="group p-8 rounded-3xl border border-white/[0.04] bg-[#0a0a0c] hover:bg-[#111113] transition-all hover:border-purple-500/30 hover:shadow-2xl hover:shadow-purple-500/10 cursor-default relative overflow-hidden md:translate-y-8">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 blur-3xl rounded-full group-hover:bg-purple-500/20 transition-colors pointer-events-none" />
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:-rotate-3 transition-transform">
              <Brain className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-white">Adaptive Difficulty</h3>
            <p className="text-gray-400 text-sm leading-relaxed font-medium">
              Upload your resume and the system dynamically adjusts the questions to target your specific experience level and tech stack.
            </p>
          </div>

          {/* Feature Card 3 */}
          <div className="group p-8 rounded-3xl border border-white/[0.04] bg-[#0a0a0c] hover:bg-[#111113] transition-all hover:border-emerald-500/30 hover:shadow-2xl hover:shadow-emerald-500/10 cursor-default relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-3xl rounded-full group-hover:bg-emerald-500/20 transition-colors pointer-events-none" />
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform">
              <BarChart3 className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-white">Brutal Feedback</h3>
            <p className="text-gray-400 text-sm leading-relaxed font-medium">
              Get an honest, brutally constructive breakdown of your performance. See your weak spots, track your XP growth, and iterate instantly.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 max-w-5xl mx-auto px-5 pb-32">
        <div className="rounded-[2.5rem] border border-white/[0.08] bg-gradient-to-b from-[#111113] to-[#050505] p-12 md:p-20 text-center relative overflow-hidden shadow-2xl">
          <div className="absolute top-[-50%] left-[50%] translate-x-[-50%] w-[100%] h-[100%] rounded-full bg-indigo-600/10 blur-[100px] pointer-events-none" />
          
          <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white relative z-10">Your next offer is waiting.</h2>
          <p className="text-gray-400 text-lg mb-10 max-w-xl mx-auto relative z-10 font-medium">
            Stop guessing and start practicing. Create a free account to unlock your first interview simulation and begin climbing the ranks.
          </p>
          
          <Link href={userId ? "/dashboard" : "/sign-up"} className="relative z-10 inline-block">
            <button className="h-14 px-10 text-base font-bold bg-white text-black hover:bg-gray-200 rounded-full transition-all flex items-center gap-2 shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:scale-105 active:scale-95 group mx-auto">
              {userId ? "Return to Dashboard" : "Create Free Account"}
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.04] py-10 bg-[#020202] relative z-10">
        <div className="max-w-6xl mx-auto px-5 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-indigo-500" />
            <span className="text-sm font-bold text-gray-300">InterviewSim</span>
          </div>
          <span className="text-sm text-gray-600 font-medium">Designed to help you win.</span>
        </div>
      </footer>
    </div>
  );
}
