import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { CREATE_TABLES_SQL } from "@/lib/schema";

// This route initializes the database tables
// Call it once: GET /api/migrate
export async function GET() {
  try {
    const DATABASE_URL = process.env.DATABASE_URL;
    if (!DATABASE_URL) {
      return NextResponse.json({ error: "Missing DATABASE_URL" }, { status: 500 });
    }

    // Use the http client (not tagged template) for raw SQL strings
    const { Client } = await import("pg");
    const client = new Client({ connectionString: DATABASE_URL });
    await client.connect();
    await client.query(CREATE_TABLES_SQL);
    await client.end();

    return NextResponse.json({ success: true, message: "Tables created successfully" });
  } catch (error: any) {
    console.error("Migration error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
