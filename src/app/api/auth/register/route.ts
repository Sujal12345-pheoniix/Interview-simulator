import { NextResponse } from "next/server";
import getDb from "@/lib/db";
import bcrypt from "bcryptjs";
import { createSession } from "@/lib/session";

export async function POST(req: Request) {
  try {
    const { email, password, name } = await req.json();

    if (!email || !password || !name) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const sql = getDb();
    const existing = await sql`SELECT id FROM users WHERE email = ${email}`;
    if (existing.length > 0) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const users = await sql`
      INSERT INTO users (email, password_hash, name, auth_provider)
      VALUES (${email}, ${passwordHash}, ${name}, 'custom')
      RETURNING id
    `;

    const userId = users[0].id;
    await createSession(userId);

    return NextResponse.json({ success: true, userId });
  } catch (error: any) {
    console.error("Register Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
