import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  console.error("\n❌ DATABASE_URL environment variable is not set!");
  console.error("\n📋 Deployment Checklist:");
  console.error("   1. Create a database on Neon.tech (https://neon.tech)");
  console.error("   2. Copy the connection string");
  console.error("   3. Set DATABASE_URL in your deployment platform:");
  console.error("      - For Render.com: Environment → Add DATABASE_URL");
  console.error("      - For Replit: Secrets → Add DATABASE_URL");
  console.error("   4. The connection string should look like:");
  console.error("      postgresql://user:pass@host.neon.tech/dbname?sslmode=require");
  console.error("\n💡 See .env.example for all required environment variables\n");
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle({ client: pool, schema });
