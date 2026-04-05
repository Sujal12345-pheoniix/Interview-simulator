import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import connectToDatabase from "@/lib/db";
import Result from "@/models/Result";
import User from "@/models/User";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resultId = (await params).id;

    await connectToDatabase();
    
    const user = await User.findOne({ clerkId });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const result = await Result.findOne({ interviewId: resultId });
    if (!result) {
      return NextResponse.json({ error: "Result not found for this interview" }, { status: 404 });
    }

    if (result.userId.toString() !== user._id.toString()) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(result, { status: 200 });
    
  } catch (error: any) {
    console.error("Fetch Result API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch result", details: error.message },
      { status: 500 }
    );
  }
}
