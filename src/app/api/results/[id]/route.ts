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

    const resultId = (await params).id;

    const sql = getDb();

    const users = await sql`SELECT id FROM users WHERE clerk_id = ${clerkId}`;
    if (users.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    const userId = users[0].id;

    // Look up result by interview_id
    const results = await sql`
      SELECT * FROM results WHERE interview_id = ${resultId}
    `;
    if (results.length === 0) {
      return NextResponse.json(
        { error: "Result not found for this interview" },
        { status: 404 }
      );
    }
    const result = results[0];

    if (result.user_id !== userId) {
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
