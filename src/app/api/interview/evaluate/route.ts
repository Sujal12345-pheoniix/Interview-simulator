import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import connectToDatabase from "@/lib/db";
import Question from "@/models/Question";
import Interview from "@/models/Interview";
import { evaluateAnswer } from "@/lib/ai/answerEvaluator";

export async function POST(req: Request) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { questionId, userAnswer, codeSubmission } = body;

    if (!questionId || !userAnswer) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    await connectToDatabase();
    
    // Fetch question
    const question = await Question.findById(questionId);
    if (!question) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 });
    }

    // Verify interview ownership mapping (optional but good for security)
    const interview = await Interview.findById(question.interviewId);
    if (!interview) {
      return NextResponse.json({ error: "Interview not found" }, { status: 404 });
    }
    
    // 1. Setup the interview to be 'in_progress' if pending
    if (interview.status === "pending") {
      interview.status = "in_progress";
      interview.startedAt = new Date();
      await interview.save();
    }

    // 2. Evaluate answer using AI
    const evaluation = await evaluateAnswer(
      question.text,
      userAnswer,
      question.expectedAnswer || ""
    );

    // 3. Save evaluation to DB
    question.userAnswer = userAnswer;
    question.codeSubmission = codeSubmission;
    question.score = evaluation.score;
    question.feedback = evaluation.feedback;
    // We can also store strengths/weaknesses if we expand the model, but for now we rely on the report phase
    await question.save();

    return NextResponse.json({
      success: true,
      score: evaluation.score,
      feedback: evaluation.feedback,
    });
    
  } catch (error: any) {
    console.error("Evaluate Answer API Error:", error);
    return NextResponse.json(
      { error: "Failed to evaluate answer", details: error.message },
      { status: 500 }
    );
  }
}
