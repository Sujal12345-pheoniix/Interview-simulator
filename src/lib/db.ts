import { neon } from "@neondatabase/serverless";

export class DatabaseConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DatabaseConfigError";
  }
}

function getDb() {
  const DATABASE_URL = process.env.DATABASE_URL;

  if (!DATABASE_URL) {
    throw new DatabaseConfigError(
      "Missing DATABASE_URL. Please define DATABASE_URL inside .env.local"
    );
  }

  return neon(DATABASE_URL);
}

export default getDb;
