import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import getDb from "@/lib/db";
import { generateQuestions } from "@/lib/ai/questionGenerator";
import { parseResume } from "@/lib/ai/resumeParser";

export async function POST(req: Request) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { role, level, type, resume } = body;

    if (!role || !level || !type) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const sql = getDb();

    // Find our mapped PostgreSQL user
    const users = await sql`SELECT id FROM users WHERE clerk_id = ${clerkId}`;
    if (users.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    const userId = users[0].id;

    // Optional: Parse resume to extract context
    let parsedResumeContext = "";
    if (resume) {
      parsedResumeContext = await parseResume(resume);
    }

    // 1. Ask AI to generate questions
    const generatedQuestions = await generateQuestions(
      role,
      level,
      type,
      parsedResumeContext
    );

    // 2. Create Interview record in DB
    const interviews = await sql`
      INSERT INTO interviews (user_id, type, role, level, status)
      VALUES (${userId}, ${type}, ${role}, ${level}, 'pending')
      RETURNING id
    `;
    const interviewId = interviews[0].id;

    // 3. Create Question records
    for (let i = 0; i < generatedQuestions.length; i++) {
      const q = generatedQuestions[i];
      await sql`
        INSERT INTO questions (interview_id, text, category, difficulty, expected_answer, order_index)
        VALUES (${interviewId}, ${q.text}, ${q.category}, ${q.difficulty}, ${q.expectedAnswer ?? null}, ${i})
      `;
    }

    return NextResponse.json(
      { interviewId, message: "Interview generated successfully" },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Generate Interview API Error:", error);
    return NextResponse.json(
      { error: "Failed to generate interview", details: error.message },
      { status: 500 }
    );
  }
}
