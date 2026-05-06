import { NextResponse } from "next/server";
import { getAppAuth } from "@/lib/auth-wrapper";
import getDb from "@/lib/db";
import { evaluateAnswer } from "@/lib/ai/answerEvaluator";

export async function POST(req: Request) {
  try {
    const { userId: unifiedUserId, clerkId } = await getAppAuth();
    if (!unifiedUserId && !clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { questionId, userAnswer, codeSubmission } = body;

    if (!questionId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const sql = getDb();

    let users: any[] = [];
    if (unifiedUserId) {
      users = await sql`SELECT id FROM users WHERE id = ${unifiedUserId}`;
    } else if (clerkId) {
      users = await sql`SELECT id FROM users WHERE clerk_id = ${clerkId}`;
    }

    if (users.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    const userId = users[0].id;

    // Fetch question
    const questions = await sql`
      SELECT q.*, i.type, i.status, i.user_id as interview_user_id, i.id as interview_id_val
      FROM questions q
      JOIN interviews i ON i.id = q.interview_id
      WHERE q.id = ${questionId}
    `;
    if (questions.length === 0) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 });
    }
    const question = questions[0];

    // Security: Verify interview ownership
    if (question.interview_user_id !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const normalizedAnswer = typeof userAnswer === "string" ? userAnswer.trim() : "";
    const normalizedCode = typeof codeSubmission === "string" ? codeSubmission.trim() : "";
    const hasCode =
      normalizedCode.length > 0 &&
      normalizedCode !== "// Write your code here...";

    if (question.type === "coding") {
      if (!normalizedAnswer && !hasCode) {
        return NextResponse.json(
          { error: "Provide an explanation or code submission" },
          { status: 400 }
        );
      }
    } else if (!normalizedAnswer) {
      return NextResponse.json(
        { error: "Answer is required" },
        { status: 400 }
      );
    }

    // Start interview if still pending
    if (question.status === "pending") {
      await sql`
        UPDATE interviews
        SET status = 'in_progress', started_at = NOW(), updated_at = NOW()
        WHERE id = ${question.interview_id_val}
      `;
    }

    // Evaluate answer using AI
    const evaluation = await evaluateAnswer(
      question.text,
      question.type === "coding" && hasCode
        ? `${normalizedAnswer || "No written explanation provided."}\n\nSubmitted code:\n${normalizedCode}`
        : normalizedAnswer,
      question.expected_answer || ""
    );

    const safeScore = Number.isFinite(evaluation.score)
      ? Math.min(10, Math.max(0, Math.round(evaluation.score)))
      : 0;

    const safeStrengths = Array.isArray(evaluation.strengths) ? evaluation.strengths : [];
    const safeWeaknesses = Array.isArray(evaluation.weaknesses) ? evaluation.weaknesses : [];

    // Save evaluation to DB
    await sql`
      UPDATE questions
      SET
        user_answer = ${normalizedAnswer},
        code_submission = ${hasCode ? normalizedCode : null},
        score = ${safeScore},
        feedback = ${evaluation.feedback},
        strengths = ${safeStrengths},
        weaknesses = ${safeWeaknesses},
        updated_at = NOW()
      WHERE id = ${questionId}
    `;

    return NextResponse.json({
      success: true,
      score: safeScore,
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
