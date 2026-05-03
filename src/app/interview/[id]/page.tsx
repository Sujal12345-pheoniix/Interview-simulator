"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { QuestionCard } from "@/components/interview/QuestionCard";
import { Timer } from "@/components/interview/Timer";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Loader2, AlertCircle } from "lucide-react";

export default function InterviewRoomPage() {
  const params = useParams();
  const router = useRouter();
  const [interview, setInterview] = useState<any>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [timeWarning, setTimeWarning] = useState<string>("");

  useEffect(() => {
    const fetchInterview = async () => {
      try {
        const id = params?.id;
        if (!id) return;
        
        const res = await fetch(`/api/interview/${id}`);
        if (!res.ok) throw new Error("Failed to fetch");
        
        const data = await res.json();
        if (data.status === "completed") {
          router.replace(`/results/${id}`);
          return;
        }
        
        setInterview(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchInterview();
  }, [params, router]);

  const handleTimeUp = () => {
    setTimeWarning("Time is up for this question. Submit your best answer to continue.");
  };

  const handleAnswerSubmit = async (answer: string, code?: string) => {
    try {
      setSubmitting(true);
      const questionId = interview.questions[currentQuestionIndex].id;
      
      const res = await fetch(`/api/interview/evaluate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId,
          userAnswer: answer,
          codeSubmission: code
        }),
      });

      if (!res.ok) throw new Error("Failed to submit");

      setTimeWarning("");
      
      // Move to next question or complete
      if (currentQuestionIndex < interview.questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
      } else {
        await finishInterview();
      }
      
    } catch (error) {
      console.error(error);
      alert("Error submitting answer.");
    } finally {
      setSubmitting(false);
    }
  };

  const finishInterview = async () => {
    try {
      setCompleting(true);
      const res = await fetch(`/api/interview/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ interviewId: interview.id }),
      });

      if (!res.ok) throw new Error("Failed to complete");
      
      router.push(`/results/${interview.id}`);
    } catch (error) {
      console.error(error);
      alert("Error generating final report.");
      setCompleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#030303]">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (!interview || !interview.questions) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#030303] text-gray-400 flex-col gap-4">
        <AlertCircle className="h-10 w-10 text-red-500" />
        <p>Interview session not found.</p>
        <Button onClick={() => router.push("/dashboard")} variant="outline">Back to Dashboard</Button>
      </div>
    );
  }

  const currentQuestion = interview.questions[currentQuestionIndex];
  const progressPercent = ((currentQuestionIndex + 1) / interview.questions.length) * 100;

  return (
    <div className="min-h-screen bg-[#030303] text-gray-100 flex flex-col">
      <header className="h-16 border-b border-white/5 bg-black/50 px-6 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <span className="font-semibold text-lg capitalize">{interview.type} Interview</span>
          <span className="px-2 py-1 bg-white/5 rounded text-xs text-gray-400 capitalize border border-white/10">
            {interview.role} • {interview.level}
          </span>
        </div>
        
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-gray-400">
            Question {currentQuestionIndex + 1} of {interview.questions.length}
          </span>
          {interview.type === "coding" ? (
            <Timer initialSeconds={45 * 60} onTimeUp={handleTimeUp} />
          ) : (
            <Timer initialSeconds={5 * 60} onTimeUp={handleTimeUp} />
          )}
        </div>
      </header>

      <Progress value={progressPercent} className="h-1 rounded-none bg-gray-900" />

      <main className="flex-1 max-w-5xl mx-auto w-full p-6 py-10">
        {completing ? (
          <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-6">
            <div className="w-16 h-16 relative">
              <div className="absolute inset-0 border-4 border-indigo-500/20 rounded-full animate-ping"></div>
              <Loader2 className="h-full w-full animate-spin text-indigo-500" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold mb-2">Analyzing Performance...</h2>
              <p className="text-gray-400 max-w-sm mx-auto">
                GPT-4o is evaluating your responses and generating a comprehensive feedback report.
              </p>
            </div>
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {timeWarning ? (
              <div className="mb-5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
                {timeWarning}
              </div>
            ) : null}
            <QuestionCard 
              question={currentQuestion}
              type={interview.type}
              onSubmit={handleAnswerSubmit}
              isSubmitting={submitting}
            />
          </div>
        )}
      </main>
    </div>
  );
}
