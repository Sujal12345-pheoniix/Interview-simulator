import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import getDb from "@/lib/db";
import { generateInterviewReport } from "@/lib/ai/reportGenerator";

export async function POST(req: Request) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { interviewId } = body;

    if (!interviewId) {
      return NextResponse.json({ error: "Missing interviewId" }, { status: 400 });
    }

    const sql = getDb();

    const users = await sql`SELECT id FROM users WHERE clerk_id = ${clerkId}`;
    if (users.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    const userId = users[0].id;

    const interviews = await sql`
      SELECT * FROM interviews WHERE id = ${interviewId}
    `;
    if (interviews.length === 0) {
      return NextResponse.json({ error: "Interview not found" }, { status: 404 });
    }
    const interview = interviews[0];

    if (interview.user_id !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Check if result already exists
    const existingResults = await sql`
      SELECT * FROM results WHERE interview_id = ${interviewId}
    `;
    if (existingResults.length > 0) {
      if (interview.status !== "completed") {
        await sql`
          UPDATE interviews
          SET status = 'completed', completed_at = NOW(), updated_at = NOW()
          WHERE id = ${interviewId}
        `;
      }
      return NextResponse.json(existingResults[0], { status: 200 });
    }

    // Fetch ordered questions
    const questionDocs = await sql`
      SELECT * FROM questions
      WHERE interview_id = ${interviewId}
      ORDER BY order_index ASC
    `;

    if (questionDocs.length === 0) {
      return NextResponse.json(
        { error: "No questions found for this interview" },
        { status: 400 }
      );
    }

    // Prepare data for report generation
    const questionsData = questionDocs.map((q: any) => ({
      text: q.text,
      category: q.category,
    }));
    const answersData = questionDocs.map((q: any) => ({
      score: q.score || 0,
      feedback: q.feedback || "",
      strengths: Array.isArray(q.strengths) ? q.strengths : [],
      weaknesses: Array.isArray(q.weaknesses) ? q.weaknesses : [],
    }));

    // Generate comprehensive report
    const reportData = await generateInterviewReport(questionsData, answersData);

    // Save result to DB
    const results = await sql`
      INSERT INTO results (
        interview_id, user_id, overall_score, category_scores,
        strengths, weaknesses, recommendations, ai_summary
      ) VALUES (
        ${interviewId},
        ${userId},
        ${reportData.overallScore},
        ${JSON.stringify(reportData.categoryScores)},
        ${reportData.strengths},
        ${reportData.weaknesses},
        ${reportData.recommendations},
        ${reportData.aiSummary}
      )
      RETURNING *
    `;

    // Mark interview as completed
    await sql`
      UPDATE interviews
      SET status = 'completed', completed_at = NOW(), updated_at = NOW()
      WHERE id = ${interviewId}
    `;

    return NextResponse.json(results[0], { status: 201 });
  } catch (error: any) {
    console.error("Complete Interview API Error:", error);
    return NextResponse.json(
      { error: "Failed to complete interview", details: error.message },
      { status: 500 }
    );
  }
}
