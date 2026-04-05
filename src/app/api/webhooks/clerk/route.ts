import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import User from "@/models/User";

export async function POST(req: Request) {
  // You can find this in the Clerk Dashboard -> Webhooks -> choose the HTTP endpoint -> gets value
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error(
      "Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local"
    );
  }

  // Get the headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error occured -- no svix headers", {
      status: 400,
    });
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your secret.
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return new Response("Error occured", {
      status: 400,
    });
  }

  const { id } = evt.data;
  const eventType = evt.type;

  if (eventType === "user.created") {
    // Sync the user to our MongoDB
    try {
      await connectToDatabase();
      const { id: clerkId, email_addresses, first_name, last_name, image_url } = evt.data;
      
      const email = email_addresses[0]?.email_address;
      const name = [first_name, last_name].filter(Boolean).join(" ") || "Unknown User";
      
      await User.create({
        clerkId,
        email,
        name,
        avatar: image_url,
      });
      
      console.log(`User ${clerkId} synced to MongoDB`);
    } catch (error) {
      console.error("Error saving user to DB:", error);
      return new Response("Error saving user to DB", { status: 500 });
    }
  }

  if (eventType === "user.updated") {
    try {
      await connectToDatabase();
      const { id: clerkId, email_addresses, first_name, last_name, image_url } = evt.data;
      
      const email = email_addresses[0]?.email_address;
      const name = [first_name, last_name].filter(Boolean).join(" ");
      
      await User.findOneAndUpdate(
        { clerkId },
        {
          email,
          name,
          avatar: image_url,
        }
      );
      
      console.log(`User ${clerkId} updated in MongoDB`);
    } catch (error) {
      console.error("Error updating user in DB:", error);
      return new Response("Error updating user in DB", { status: 500 });
    }
  }

  if (eventType === "user.deleted") {
    try {
      await connectToDatabase();
      const { id: clerkId } = evt.data;
      
      await User.findOneAndDelete({ clerkId });
      console.log(`User ${clerkId} deleted from MongoDB`);
    } catch (error) {
      console.error("Error deleting user from DB:", error);
      return new Response("Error deleting user from DB", { status: 500 });
    }
  }

  return NextResponse.json({ message: "Webhook processed" }, { status: 200 });
}
