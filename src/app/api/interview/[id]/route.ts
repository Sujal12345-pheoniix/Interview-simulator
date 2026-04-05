import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import connectToDatabase from "@/lib/db";
import Interview from "@/models/Interview";
import Question from "@/models/Question";
import User from "@/models/User";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> } // Needs to be accessed asynchronously in Next 15+ App router context
) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const interviewId = (await params).id;

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
    
    // We manually fetch questions and attach to ensure expected typing if populate isn't sufficient
    const questions = await Question.find({ _id: { $in: interview.questions } }).select("-expectedAnswer"); // Dont send expected answer explicitly if we want to secure it, but it's okay for now.

    const interviewData = interview.toObject();
    interviewData.questions = questions; // replace populated array with full models

    return NextResponse.json(interviewData, { status: 200 });
    
  } catch (error: any) {
    console.error("Fetch Interview API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch interview", details: error.message },
      { status: 500 }
    );
  }
}
