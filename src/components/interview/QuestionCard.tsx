"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CodeEditor } from "./CodeEditor";
import { Loader2 } from "lucide-react";

interface QuestionCardProps {
  question: {
    _id: string;
    text: string;
    category: string;
    difficulty: string;
  };
  type: "behavioral" | "technical" | "coding";
  onSubmit: (answer: string, code?: string) => Promise<void>;
  isSubmitting?: boolean;
}

export function QuestionCard({ question, type, onSubmit, isSubmitting = false }: QuestionCardProps) {
  const [answer, setAnswer] = useState("");
  const [code, setCode] = useState("// Write your code here...");

  const handleSubmit = () => {
    if (type === "coding") {
      onSubmit(answer, code);
    } else {
      onSubmit(answer);
    }
  };

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case "easy": return "bg-green-500/10 text-green-500 hover:bg-green-500/20";
      case "medium": return "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20";
      case "hard": return "bg-red-500/10 text-red-500 hover:bg-red-500/20";
      default: return "";
    }
  };

  return (
    <Card className="w-full bg-[#0a0a0a] border-gray-800 text-gray-100">
      <CardHeader>
        <div className="flex justify-between items-start mb-2">
          <Badge variant="outline" className="text-indigo-400 border-indigo-500/30">
            {question.category}
          </Badge>
          <Badge variant="outline" className={getDifficultyColor(question.difficulty)}>
            {question.difficulty.toUpperCase()}
          </Badge>
        </div>
        <CardTitle className="text-xl sm:text-2xl font-light leading-relaxed">
          {question.text}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {type === "coding" && (
          <div className="space-y-4">
            <CodeEditor language="javascript" code={code} onChange={(v) => setCode(v || "")} />
            <div className="space-y-2">
              <label className="text-sm text-gray-400">Time Complexity & Explanation (Optional)</label>
              <Textarea
                placeholder="Explain your approach..."
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                className="min-h-[100px] bg-gray-900/50 border-gray-800 focus:border-indigo-500"
              />
            </div>
          </div>
        )}
        {(type === "behavioral" || type === "technical") && (
          <Textarea
            placeholder="Structure your answer using the STAR method if applicable..."
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            className="min-h-[250px] bg-gray-900/50 border-gray-800 focus:border-indigo-500 text-base p-4"
          />
        )}
      </CardContent>
      <CardFooter className="flex justify-end border-t border-gray-800 pt-6 mt-2">
        <Button 
          onClick={handleSubmit} 
          disabled={isSubmitting || (!answer.trim() && type !== "coding")}
          className="bg-indigo-600 hover:bg-indigo-700 text-white min-w-[120px]"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Evaluating...
            </>
          ) : (
            "Submit Answer"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
