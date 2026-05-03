"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Sparkles, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NewInterviewPage() {
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    role: "Frontend Engineer",
    level: "mid",
    type: "technical",
    resume: "",
  });

  const handleGenerate = async () => {
    try {
      setIsGenerating(true);
      setError("");
      const res = await fetch("/api/interview/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to generate interview");
      }

      const data = await res.json();
      router.push(`/interview/${data.interviewId}`);
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
      setIsGenerating(false);
    }
  };

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
          <span className="text-sm text-gray-300">New Interview</span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-5 pt-12 pb-20">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold mb-1.5">Set up your interview</h1>
          <p className="text-[#555] text-sm">
            Configure the details and an AI will generate personalized questions.
          </p>
        </div>

        <div className="space-y-5">
          {/* Role */}
          <div>
            <label htmlFor="role" className="block text-sm text-[#777] mb-1.5">
              Target role
            </label>
            <input
              id="role"
              type="text"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full h-10 rounded-lg border border-white/[0.08] bg-[#111113] px-3 text-sm text-gray-100 placeholder-[#333] focus:outline-none focus:border-indigo-500/50 transition-colors"
              placeholder="e.g. Frontend Engineer, Product Manager"
            />
          </div>

          {/* Level + Type */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-[#777] mb-1.5">Experience level</label>
              <Select
                value={formData.level}
                onValueChange={(val) => setFormData({ ...formData, level: val || "" })}
              >
                <SelectTrigger className="h-10 bg-[#111113] border-white/[0.08] text-gray-300 text-sm focus:ring-indigo-500/50">
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent className="bg-[#111113] border-white/[0.08] text-gray-200">
                  <SelectItem value="intern">Intern</SelectItem>
                  <SelectItem value="junior">Junior</SelectItem>
                  <SelectItem value="mid">Mid-Level</SelectItem>
                  <SelectItem value="senior">Senior</SelectItem>
                  <SelectItem value="staff">Staff / Principal</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm text-[#777] mb-1.5">Interview type</label>
              <Select
                value={formData.type}
                onValueChange={(val) => setFormData({ ...formData, type: val || "" })}
              >
                <SelectTrigger className="h-10 bg-[#111113] border-white/[0.08] text-gray-300 text-sm focus:ring-indigo-500/50">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent className="bg-[#111113] border-white/[0.08] text-gray-200">
                  <SelectItem value="behavioral">Behavioral</SelectItem>
                  <SelectItem value="technical">Technical</SelectItem>
                  <SelectItem value="coding">Coding / DSA</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Resume */}
          <div>
            <label htmlFor="resume" className="block text-sm text-[#777] mb-1.5">
              Resume{" "}
              <span className="text-[#444]">— optional, tailors questions to your experience</span>
            </label>
            <textarea
              id="resume"
              value={formData.resume}
              onChange={(e) => setFormData({ ...formData, resume: e.target.value })}
              className="w-full rounded-lg border border-white/[0.08] bg-[#111113] px-3 py-2.5 text-sm text-gray-100 placeholder-[#333] focus:outline-none focus:border-indigo-500/50 transition-colors resize-none"
              rows={6}
              placeholder="Paste your resume text here..."
            />
          </div>

          {error && (
            <div className="rounded-lg border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !formData.role.trim()}
            className="w-full h-11 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors flex items-center justify-center gap-2"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating questions...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Generate Interview
              </>
            )}
          </button>

          <p className="text-center text-xs text-[#333]">
            This usually takes 10–15 seconds.
          </p>
        </div>
      </main>
    </div>
  );
}
