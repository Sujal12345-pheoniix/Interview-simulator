import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import connectToDatabase from "@/lib/db";
import Interview from "@/models/Interview";
import Question from "@/models/Question";
import User from "@/models/User";
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

    await connectToDatabase();
    
    // Find our mapped MongoDB user
    const user = await User.findOne({ clerkId });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

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

    // 2. Create Interview document in DB
    const interview = await Interview.create({
      userId: user._id,
      type,
      role,
      level,
      status: "pending",
      questions: [],
    });

    // 3. Create Question documents
    const questionIds = [];
    for (const q of generatedQuestions) {
      const questionDoc = await Question.create({
        interviewId: interview._id,
        text: q.text,
        category: q.category,
        difficulty: q.difficulty,
        expectedAnswer: q.expectedAnswer,
      });
      questionIds.push(questionDoc._id);
    }

    // 4. Update Interview with question IDs
    interview.questions = questionIds;
    await interview.save();

    return NextResponse.json({
      interviewId: interview._id,
      message: "Interview generated successfully",
    }, { status: 201 });
    
  } catch (error: any) {
    console.error("Generate Interview API Error:", error);
    return NextResponse.json(
      { error: "Failed to generate interview", details: error.message },
      { status: 500 }
    );
  }
}
