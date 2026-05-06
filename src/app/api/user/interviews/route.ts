import { NextResponse } from "next/server";
import { getAppAuth } from "@/lib/auth-wrapper";
import getDb from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { userId: unifiedUserId, clerkId } = await getAppAuth();
    if (!unifiedUserId && !clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "10");
    const page = parseInt(searchParams.get("page") || "1");
    const offset = (page - 1) * limit;

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

    const interviews = await sql`
      SELECT * FROM interviews
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;

    const countResult = await sql`
      SELECT COUNT(*) FROM interviews WHERE user_id = ${userId}
    `;
    const total = parseInt(countResult[0].count);

    return NextResponse.json(
      {
        interviews,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit),
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Fetch User Interviews API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch interviews", details: error.message },
      { status: 500 }
    );
  }
}
