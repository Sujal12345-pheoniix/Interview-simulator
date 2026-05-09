"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import {
  ArrowRight, Code2, Brain, BarChart3, Zap, Trophy, Target,
  CheckCircle2, ChevronDown, Star, FileText, Mic, Shield, TrendingUp, Play
} from "lucide-react";

// ── Animated headline words ──────────────────────────────────────────────────
const ROTATING_WORDS = ["FAANG", "Google", "Meta", "Amazon", "Netflix", "Stripe"];

function RotatingWord() {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const iv = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIndex((i) => (i + 1) % ROTATING_WORDS.length);
        setVisible(true);
      }, 300);
    }, 2200);
    return () => clearInterval(iv);
  }, []);
  return (
    <span
      className="inline-block transition-all duration-300"
      style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(8px)" }}
    >
      {ROTATING_WORDS[index]}
    </span>
  );
}

// ── FAQ data ─────────────────────────────────────────────────────────────────
const FAQS = [
  {
    q: "What kinds of interviews can I practice?",
    a: "Technical, behavioral, and coding (DSA) interviews. Each type has tailored AI-generated questions, evaluation criteria, and feedback optimized for that format.",
  },
  {
    q: "How does the AI evaluate my answers?",
    a: "Our Gemini-powered engine scores answers on accuracy, depth, communication clarity, and critical thinking. You get a 0-10 score, detailed feedback, strengths, and specific improvements.",
  },
  {
    q: "Can I upload my resume?",
    a: "Yes — paste your resume text on the interview setup page. The AI tailors 2–3 questions directly to your stack, projects, and experience level.",
  },
  {
    q: "Is it really free to start?",
    a: "Yes. Create a free account and start your first AI interview session immediately. No credit card required.",
  },
  {
    q: "What roles and levels are supported?",
    a: "Any role you type in — Frontend, Backend, Fullstack, DevOps, Data Engineer, PM, and more. Levels range from Intern to Staff/Principal.",
  },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-white/[0.06] last:border-0">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between py-5 text-left gap-4 group"
      >
        <span className="text-sm font-medium text-gray-200 group-hover:text-white transition-colors">{q}</span>
        <ChevronDown
          className="h-4 w-4 text-gray-500 shrink-0 transition-transform duration-200"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
        />
      </button>
      <div
        className="overflow-hidden transition-all duration-300"
        style={{ maxHeight: open ? "200px" : "0px", opacity: open ? 1 : 0 }}
      >
        <p className="pb-5 text-sm text-gray-400 leading-relaxed">{a}</p>
      </div>
    </div>
  );
}

// ── Features ─────────────────────────────────────────────────────────────────
const FEATURES = [
  {
    icon: Brain,
    color: "indigo",
    title: "AI-Generated Questions",
    desc: "Gemini generates fresh, role-specific questions every session — tailored to your level, domain, and resume.",
  },
  {
    icon: Code2,
    color: "cyan",
    title: "Live Code Editor",
    desc: "Full Monaco editor with syntax highlighting, multi-language support, and algorithm challenges under real time pressure.",
  },
  {
    icon: BarChart3,
    color: "emerald",
    title: "Deep Analytics",
    desc: "Score trends, category breakdowns, weak-topic heatmaps, and momentum tracking across every session.",
  },
  {
    icon: FileText,
    color: "amber",
    title: "Resume-Tailored Prep",
    desc: "Paste your resume and the AI extracts your stack to craft questions targeting your actual experience.",
  },
  {
    icon: Mic,
    color: "purple",
    title: "Voice Input",
    desc: "Answer questions verbally with built-in speech recognition — simulate a real verbal interview naturally.",
  },
  {
    icon: Shield,
    color: "rose",
    title: "AI Proctoring",
    desc: "Webcam monitoring with attention tracking simulation gives you the pressure of an actual interview room.",
  },
];

const COLOR_MAP: Record<string, { bg: string; border: string; text: string; shadow: string }> = {
  indigo: { bg: "bg-indigo-500/10", border: "border-indigo-500/20", text: "text-indigo-400", shadow: "shadow-indigo-500/10" },
  cyan:   { bg: "bg-cyan-500/10",   border: "border-cyan-500/20",   text: "text-cyan-400",   shadow: "shadow-cyan-500/10" },
  emerald:{ bg: "bg-emerald-500/10",border: "border-emerald-500/20",text: "text-emerald-400",shadow: "shadow-emerald-500/10" },
  amber:  { bg: "bg-amber-500/10",  border: "border-amber-500/20",  text: "text-amber-400",  shadow: "shadow-amber-500/10" },
  purple: { bg: "bg-purple-500/10", border: "border-purple-500/20", text: "text-purple-400", shadow: "shadow-purple-500/10" },
  rose:   { bg: "bg-rose-500/10",   border: "border-rose-500/20",   text: "text-rose-400",   shadow: "shadow-rose-500/10" },
};

// ── Testimonials ──────────────────────────────────────────────────────────────
const TESTIMONIALS = [
  {
    name: "Aisha Patel",
    role: "SWE @ Google",
    avatar: "AP",
    color: "from-indigo-500 to-purple-600",
    text: "I did 15 sessions before my Google loop. The AI feedback was brutally honest — exactly what I needed. Got the offer.",
  },
  {
    name: "Marcus Chen",
    role: "Senior Engineer @ Meta",
    avatar: "MC",
    color: "from-emerald-500 to-cyan-600",
    text: "The resume-tailored questions caught me off guard — in the best way. It asked about my exact projects. Real preparation.",
  },
  {
    name: "Priya Sharma",
    role: "Frontend Dev @ Stripe",
    avatar: "PS",
    color: "from-amber-500 to-orange-600",
    text: "Analytics showed my system design score was weak. I focused there for a week and jumped from 5.2 to 8.1. Incredible tool.",
  },
];

// ── Main Component ────────────────────────────────────────────────────────────
export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <div className="min-h-screen bg-[#080809] text-[#ededf0] overflow-x-hidden">

      {/* ── Ambient background blobs ── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] rounded-full bg-indigo-600/8 blur-[120px]" />
        <div className="absolute -bottom-[20%] -right-[10%] w-[55%] h-[55%] rounded-full bg-purple-600/8 blur-[120px]" />
        <div className="absolute top-[40%] left-[30%] w-[40%] h-[30%] rounded-full bg-cyan-600/5 blur-[100px]" />
      </div>

      {/* ── Navbar ── */}
      <nav
        className="fixed top-0 w-full z-50 transition-all duration-300"
        style={{
          background: scrolled ? "rgba(8,8,9,0.85)" : "transparent",
          backdropFilter: scrolled ? "blur(20px)" : "none",
          borderBottom: scrolled ? "1px solid rgba(255,255,255,0.06)" : "1px solid transparent",
        }}
      >
        <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-200">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <span className="text-white font-bold tracking-tight text-[17px]">InterviewSim</span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            <a href="#features" className="px-3 py-2 text-sm text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/5">Features</a>
            <a href="#testimonials" className="px-3 py-2 text-sm text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/5">Testimonials</a>
            <a href="#faq" className="px-3 py-2 text-sm text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/5">FAQ</a>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/sign-in" className="hidden sm:block">
              <button className="h-9 px-4 text-sm font-medium text-gray-400 hover:text-white transition-colors rounded-full hover:bg-white/5">
                Sign in
              </button>
            </Link>
            <Link href="/sign-up">
              <button className="h-9 px-5 text-sm font-semibold bg-white text-black hover:bg-gray-100 rounded-full transition-all shadow-lg shadow-white/10 hover:scale-105 active:scale-95">
                Get started free
              </button>
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative max-w-6xl mx-auto px-5 pt-36 pb-20 md:pt-44 md:pb-28 flex flex-col items-center text-center z-10">

        <div
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs font-semibold text-indigo-300 mb-8"
          style={{ animation: "slide-up-fade 0.6s cubic-bezier(0.16,1,0.3,1) both" }}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          Trusted by 2,000+ engineers landing top-tier roles
        </div>

        <h1
          className="text-5xl md:text-7xl lg:text-[82px] font-black tracking-tight leading-[1.03] mb-6 max-w-4xl"
          style={{ animation: "slide-up-fade 0.7s 0.1s cubic-bezier(0.16,1,0.3,1) both" }}
        >
          <span className="text-white">Master Interviews</span>
          <br />
          <span className="text-white">with </span>
          <span
            style={{
              background: "linear-gradient(135deg, #818cf8, #a5b4fc, #c4b5fd)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            AI-Powered
          </span>
          <br />
          <span className="text-white">Practice</span>
        </h1>

        <p
          className="text-gray-400 text-lg md:text-xl max-w-2xl leading-relaxed mb-10 font-medium"
          style={{ animation: "slide-up-fade 0.7s 0.2s cubic-bezier(0.16,1,0.3,1) both" }}
        >
          Simulate real <RotatingWord />-level interviews. Get scored, get feedback, get the offer.
          Role-specific AI questions tailored to your resume and experience level.
        </p>

        <div
          className="flex flex-col sm:flex-row items-center gap-3 mb-20"
          style={{ animation: "slide-up-fade 0.7s 0.3s cubic-bezier(0.16,1,0.3,1) both" }}
        >
          <Link href="/sign-up">
            <button className="h-13 px-8 text-base font-bold bg-white text-black hover:bg-gray-100 rounded-full transition-all flex items-center gap-2 shadow-[0_0_40px_rgba(255,255,255,0.15)] hover:shadow-[0_0_60px_rgba(255,255,255,0.2)] hover:scale-105 active:scale-95 group">
              Start practicing free
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </Link>
          <Link href="/sign-in">
            <button className="h-13 px-8 text-base font-semibold text-gray-300 bg-white/5 border border-white/10 hover:bg-white/8 hover:border-white/15 rounded-full transition-all hover:scale-105 active:scale-95 flex items-center gap-2">
              <Play className="h-4 w-4 text-indigo-400" />
              Watch demo
            </button>
          </Link>
        </div>

        {/* Floating stats */}
        <div
          className="w-full max-w-3xl grid grid-cols-2 md:grid-cols-4 gap-3"
          style={{ animation: "slide-up-fade 0.8s 0.4s cubic-bezier(0.16,1,0.3,1) both" }}
        >
          {[
            { icon: Target, color: "text-indigo-400", value: "500+", label: "Questions Generated" },
            { icon: CheckCircle2, color: "text-emerald-400", value: "93%", label: "Offer Rate" },
            { icon: Trophy, color: "text-amber-400", value: "2,000+", label: "Active Users" },
            { icon: Zap, color: "text-purple-400", value: "Real-time", label: "AI Feedback" },
          ].map(({ icon: Icon, color, value, label }) => (
            <div
              key={label}
              className="p-4 rounded-2xl border border-white/[0.05] bg-white/[0.02] flex flex-col items-center gap-2 hover:bg-white/[0.04] hover:border-white/[0.08] transition-all cursor-default"
            >
              <Icon className={`w-5 h-5 ${color}`} />
              <span className="text-xl font-bold text-white">{value}</span>
              <span className="text-[10px] uppercase tracking-wider text-gray-500 font-medium text-center">{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="relative z-10 max-w-6xl mx-auto px-5 py-24 border-t border-white/[0.04]">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-indigo-400 uppercase tracking-widest mb-4">
            <Zap className="w-3.5 h-3.5" /> Everything you need
          </div>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
            Built for engineers who take<br />
            <span style={{ background: "linear-gradient(135deg,#a5b4fc,#c4b5fd)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              preparation seriously
            </span>
          </h2>
          <p className="text-gray-400 text-base max-w-xl mx-auto">
            Every feature is designed to compress months of interview prep into focused, high-signal sessions.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map(({ icon: Icon, color, title, desc }, i) => {
            const c = COLOR_MAP[color];
            return (
              <div
                key={title}
                className={`group relative p-7 rounded-2xl border border-white/[0.05] bg-[#0e0e10] hover:bg-[#131315] transition-all hover:border-white/[0.1] hover:shadow-xl cursor-default overflow-hidden`}
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <div className={`absolute top-0 right-0 w-28 h-28 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${c.bg}`} />
                <div className={`w-11 h-11 rounded-xl ${c.bg} border ${c.border} ${c.text} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-200`}>
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-base font-semibold mb-2 text-white">{title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="relative z-10 max-w-5xl mx-auto px-5 py-24 border-t border-white/[0.04]">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">Go from setup to feedback in minutes</h2>
          <p className="text-gray-400 text-base">Three steps. Zero friction.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8 relative">
          <div className="hidden md:block absolute top-8 left-[33%] right-[33%] h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          {[
            { step: "01", title: "Configure your session", desc: "Pick a role, level, and interview type. Optionally paste your resume for personalized questions.", color: "text-indigo-400" },
            { step: "02", title: "Answer live questions", desc: "An AI interviewer presents questions one by one. Code, type, or speak your answers in a focused environment.", color: "text-purple-400" },
            { step: "03", title: "Get deep feedback", desc: "Receive a detailed scorecard with category scores, specific weaknesses, and an actionable improvement plan.", color: "text-emerald-400" },
          ].map(({ step, title, desc, color }) => (
            <div key={step} className="flex flex-col items-center text-center">
              <div className={`text-5xl font-black ${color} opacity-30 mb-4 font-mono`}>{step}</div>
              <h3 className="text-base font-semibold text-white mb-2">{title}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section id="testimonials" className="relative z-10 max-w-6xl mx-auto px-5 py-24 border-t border-white/[0.04]">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">Engineers who landed the offer</h2>
          <div className="flex items-center justify-center gap-1 mt-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
            ))}
            <span className="ml-2 text-sm text-gray-400">4.9 / 5 from 200+ reviews</span>
          </div>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {TESTIMONIALS.map(({ name, role, avatar, color, text }) => (
            <div key={name} className="p-6 rounded-2xl border border-white/[0.06] bg-[#0e0e10] hover:bg-[#131315] hover:border-white/[0.1] transition-all">
              <div className="flex items-center gap-1 mb-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                ))}
              </div>
              <p className="text-sm text-gray-300 leading-relaxed mb-6">"{text}"</p>
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${color} flex items-center justify-center text-white text-xs font-bold shrink-0`}>
                  {avatar}
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">{name}</div>
                  <div className="text-xs text-gray-500">{role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="relative z-10 max-w-3xl mx-auto px-5 py-24 border-t border-white/[0.04]">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">Frequently asked questions</h2>
          <p className="text-gray-400 text-sm">Everything you need to know before starting.</p>
        </div>
        <div className="rounded-2xl border border-white/[0.06] bg-[#0e0e10] px-6">
          {FAQS.map((f) => (
            <FAQItem key={f.q} q={f.q} a={f.a} />
          ))}
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="relative z-10 max-w-5xl mx-auto px-5 pb-28">
        <div className="rounded-3xl border border-indigo-500/20 bg-gradient-to-b from-indigo-950/40 to-[#080809] p-12 md:p-20 text-center relative overflow-hidden">
          <div className="absolute inset-0 rounded-3xl" style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(99,102,241,0.12) 0%, transparent 70%)" }} />
          <h2 className="text-3xl md:text-5xl font-bold mb-4 text-white relative z-10">Your next offer starts here.</h2>
          <p className="text-gray-400 text-lg mb-10 max-w-lg mx-auto relative z-10">
            Join 2,000+ engineers who use InterviewSim to practice smarter and interview with confidence.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center relative z-10">
            <Link href="/sign-up">
              <button className="h-12 px-8 text-base font-bold bg-white text-black hover:bg-gray-100 rounded-full transition-all flex items-center gap-2 shadow-[0_0_40px_rgba(255,255,255,0.15)] hover:scale-105 active:scale-95 group mx-auto sm:mx-0">
                Create free account
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-white/[0.04] py-10 relative z-10">
        <div className="max-w-6xl mx-auto px-5 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Zap className="w-3 h-3 text-white" />
            </div>
            <span className="text-sm font-bold text-gray-300">InterviewSim</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="#features" className="text-xs text-gray-500 hover:text-gray-300 transition-colors">Features</a>
            <Link href="/sign-in" className="text-xs text-gray-500 hover:text-gray-300 transition-colors">Sign In</Link>
            <Link href="/sign-up" className="text-xs text-gray-500 hover:text-gray-300 transition-colors">Get Started</Link>
          </div>
          <span className="text-xs text-gray-600">© {new Date().getFullYear()} InterviewSim. Built to get you hired.</span>
        </div>
      </footer>
    </div>
  );
}
