import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import connectToDatabase from "@/lib/db";
import Interview from "@/models/Interview";
import Question from "@/models/Question";
import Result from "@/models/Result";
import User from "@/models/User";
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

    await connectToDatabase();
    
    const user = await User.findOne({ clerkId });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const interview = await Interview.findById(interviewId).populate("questions");
    if (!interview) {
      return NextResponse.json({ error: "Interview not found" }, { status: 404 });
    }

    if (interview.userId.toString() !== user._id.toString()) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Check if result already exists
    const existingResult = await Result.findOne({ interviewId });
    if (existingResult) {
      return NextResponse.json(existingResult, { status: 200 });
    }

    const questions = await Question.find({ _id: { $in: interview.questions } });
    
    // Prepare data for report generation
    const questionsData = questions.map(q => ({ text: q.text, category: q.category }));
    const answersData = questions.map(q => ({
      score: q.score || 0,
      feedback: q.feedback || "",
      strengths: [], // Since we didn't store these in Question model, we can default to empty OR update Question to store them later
      weaknesses: []
    }));

    // Generate comprehensive report
    const reportData = await generateInterviewReport(questionsData, answersData);

    // Save result to DB
    const result = await Result.create({
      interviewId: interview._id,
      userId: user._id,
      overallScore: reportData.overallScore,
      categoryScores: reportData.categoryScores,
      strengths: reportData.strengths,
      weaknesses: reportData.weaknesses,
      recommendations: reportData.recommendations,
      aiSummary: reportData.aiSummary,
    });

    // Mark interview as completed
    interview.status = "completed";
    interview.completedAt = new Date();
    await interview.save();

    return NextResponse.json(result, { status: 201 });
    
  } catch (error: any) {
    console.error("Complete Interview API Error:", error);
    return NextResponse.json(
      { error: "Failed to complete interview", details: error.message },
      { status: 500 }
    );
  }
}
