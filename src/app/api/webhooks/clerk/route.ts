import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import getDb from "@/lib/db";

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error(
      "Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local"
    );
  }

  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error occured -- no svix headers", { status: 400 });
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);

  const wh = new Webhook(WEBHOOK_SECRET);
  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return new Response("Error occured", { status: 400 });
  }

  const eventType = evt.type;

  if (eventType === "user.created") {
    try {
      const sql = getDb();
      const { id: clerkId, email_addresses, first_name, last_name, image_url } = evt.data;

      const email = email_addresses[0]?.email_address;
      const name = [first_name, last_name].filter(Boolean).join(" ") || "Unknown User";

      await sql`
        INSERT INTO users (clerk_id, email, name, avatar)
        VALUES (${clerkId}, ${email}, ${name}, ${image_url})
        ON CONFLICT (clerk_id) DO NOTHING
      `;

      console.log(`User ${clerkId} synced to PostgreSQL`);
    } catch (error) {
      console.error("Error saving user to DB:", error);
      return new Response("Error saving user to DB", { status: 500 });
    }
  }

  if (eventType === "user.updated") {
    try {
      const sql = getDb();
      const { id: clerkId, email_addresses, first_name, last_name, image_url } = evt.data;

      const email = email_addresses[0]?.email_address;
      const name = [first_name, last_name].filter(Boolean).join(" ");

      await sql`
        UPDATE users
        SET email = ${email}, name = ${name}, avatar = ${image_url}, updated_at = NOW()
        WHERE clerk_id = ${clerkId}
      `;

      console.log(`User ${clerkId} updated in PostgreSQL`);
    } catch (error) {
      console.error("Error updating user in DB:", error);
      return new Response("Error updating user in DB", { status: 500 });
    }
  }

  if (eventType === "user.deleted") {
    try {
      const sql = getDb();
      const { id: clerkId } = evt.data;

      await sql`DELETE FROM users WHERE clerk_id = ${clerkId}`;
      console.log(`User ${clerkId} deleted from PostgreSQL`);
    } catch (error) {
      console.error("Error deleting user from DB:", error);
      return new Response("Error deleting user from DB", { status: 500 });
    }
  }

  return NextResponse.json({ message: "Webhook processed" }, { status: 200 });
}
