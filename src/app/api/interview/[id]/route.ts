import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import getDb from "@/lib/db";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const interviewId = (await params).id;

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

    const questions = await sql`
      SELECT
        id, interview_id, text, category, difficulty,
        user_answer, code_submission, score, feedback, strengths, weaknesses, order_index
      FROM questions
      WHERE interview_id = ${interviewId}
      ORDER BY order_index ASC
    `;

    return NextResponse.json({ ...interview, questions }, { status: 200 });
  } catch (error: any) {
    console.error("Fetch Interview API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch interview", details: error.message },
      { status: 500 }
    );
  }
}
