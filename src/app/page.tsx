import Link from "next/link";
import { ArrowRight, Code2, Brain, BarChart3, LogIn } from "lucide-react";
import { auth } from "@clerk/nextjs/server";

export default async function LandingPage() {
  const { userId } = await auth();

  return (
    <div className="min-h-screen bg-[#0c0c0e] text-gray-100">

      {/* Nav */}
      <nav className="fixed top-0 w-full border-b border-white/[0.06] bg-[#0c0c0e]/80 backdrop-blur-sm z-50">
        <div className="max-w-5xl mx-auto px-5 h-13 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-indigo-400 font-semibold text-[15px] tracking-tight">InterviewSim</span>
          </div>
          <div className="flex items-center gap-2">
            {userId ? (
              <Link href="/dashboard">
                <button className="h-8 px-4 text-sm bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors">
                  Dashboard
                </button>
              </Link>
            ) : (
              <>
                <Link href="/sign-in">
                  <button className="h-8 px-4 text-sm text-[#666] hover:text-white transition-colors flex items-center gap-1.5">
                    <LogIn className="h-3.5 w-3.5" />
                    Sign in
                  </button>
                </Link>
                <Link href="/sign-up">
                  <button className="h-8 px-4 text-sm bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors">
                    Get started
                  </button>
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-5 pt-36 pb-24">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-xs text-[#666] mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
          AI-powered — runs on Gemini
        </div>

        <h1 className="text-5xl md:text-6xl font-bold tracking-tight leading-[1.1] mb-6 max-w-2xl">
          Practice Interviews.{" "}
          <br />
          <span className="text-[#444]">Get Better.</span>{" "}
          <br />
          Get Hired.
        </h1>

        <p className="text-[#555] text-lg max-w-xl leading-relaxed mb-10">
          Realistic technical, behavioral, and coding interview simulations.
          Answer questions, get scored, understand exactly what to fix.
        </p>

        <div className="flex items-center gap-3">
          <Link href={userId ? "/dashboard" : "/sign-up"}>
            <button className="h-11 px-6 text-sm bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors flex items-center gap-2 font-medium">
              Start Interview
              <ArrowRight className="h-4 w-4" />
            </button>
          </Link>
          <Link href={userId ? "/interview/new" : "/sign-in"}>
            <button className="h-11 px-6 text-sm text-[#555] hover:text-white border border-white/[0.08] hover:border-white/20 rounded-lg transition-colors">
              Try Demo
            </button>
          </Link>
        </div>
      </section>

      {/* Divider */}
      <div className="max-w-5xl mx-auto px-5">
        <div className="h-px bg-white/[0.05]" />
      </div>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-5 py-20">
        <div className="text-xs text-[#444] uppercase tracking-wider mb-8">What it does</div>
        <div className="grid md:grid-cols-3 gap-5">
          <div className="p-6 rounded-xl border border-white/[0.06] bg-[#111113]">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-4">
              <Code2 className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-semibold mb-2 text-gray-200">Realistic questions</h3>
            <p className="text-[#555] text-sm leading-relaxed">
              Integrated Monaco editor for coding. Timed. Tailored to your role and level.
            </p>
          </div>

          <div className="p-6 rounded-xl border border-white/[0.06] bg-[#111113]" style={{marginTop: "12px"}}>
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center mb-4">
              <Brain className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-semibold mb-2 text-gray-200">Resume-aware AI</h3>
            <p className="text-[#555] text-sm leading-relaxed">
              Paste your resume and questions adapt to your actual experience, not just your title.
            </p>
          </div>

          <div className="p-6 rounded-xl border border-white/[0.06] bg-[#111113]">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4">
              <BarChart3 className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-semibold mb-2 text-gray-200">Honest feedback</h3>
            <p className="text-[#555] text-sm leading-relaxed">
              Scored per-answer. Category breakdowns. Specific recommendations — not fluff.
            </p>
          </div>
        </div>
      </section>

      {/* Social proof / CTA */}
      <section className="max-w-5xl mx-auto px-5 pb-24">
        <div className="rounded-xl border border-white/[0.06] bg-[#111113] p-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="text-xl font-semibold mb-2">Ready to start practicing?</h2>
            <p className="text-[#555] text-sm">Free to use. No credit card needed. Just sign up.</p>
          </div>
          <Link href={userId ? "/dashboard" : "/sign-up"}>
            <button className="h-11 px-6 text-sm bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors flex items-center gap-2 font-medium shrink-0">
              {userId ? "Go to Dashboard" : "Create Account"}
              <ArrowRight className="h-4 w-4" />
            </button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.05] py-8">
        <div className="max-w-5xl mx-auto px-5 flex items-center justify-between">
          <span className="text-xs text-[#333]">InterviewSim</span>
          <span className="text-xs text-[#333]">Built to help you land the job.</span>
        </div>
      </footer>
    </div>
  );
}
