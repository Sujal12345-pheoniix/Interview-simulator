import { auth } from "@clerk/nextjs/server";
import { getSession } from "./session";
import getDb from "./db";

export async function getAppAuth() {
  // 1. Check Clerk
  const { userId: clerkId } = await auth();
  if (clerkId) {
    const sql = getDb();
    const users = await sql`SELECT id FROM users WHERE clerk_id = ${clerkId}`;
    if (users.length > 0) {
      return { userId: users[0].id, clerkId };
    }
    // Fallback: the user is authenticated in Clerk but not synced yet
    // This is handled in the dashboard, but for safety:
    return { userId: null, clerkId };
  }

  // 2. Check Custom Session
  const session = await getSession();
  if (session?.userId) {
    return { userId: session.userId, clerkId: null };
  }

  return { userId: null, clerkId: null };
}
