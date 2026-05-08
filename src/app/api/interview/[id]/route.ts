import { NextResponse } from "next/server";
import { getAppAuth } from "@/lib/auth-wrapper";
import prisma from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId: unifiedUserId, clerkId } = await getAppAuth();
    if (!unifiedUserId && !clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const interviewId = Number((await params).id);

    // find interview and ensure ownership
    const interview = await prisma.interview.findUnique({
      where: { id: interviewId },
      include: { questions: { orderBy: { orderIndex: 'asc' } } },
    });

    if (!interview) {
      return NextResponse.json({ error: "Interview not found" }, { status: 404 });
    }

    const userId = unifiedUserId ?? null;
    // If the authenticated principal is a Clerk user, get the mapped user id
    if (!userId && clerkId) {
      const user = await prisma.user.findFirst({ where: { clerkId } });
      if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
      if (interview.userId !== user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    } else if (userId) {
      if (interview.userId !== userId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(interview, { status: 200 });
  } catch (error: any) {
    console.error("Fetch Interview API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch interview", details: error.message },
      { status: 500 }
    );
  }
}
