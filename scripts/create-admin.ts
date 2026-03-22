/**
 * Creates or updates the admin user in PostgreSQL (same credential rules as `prisma db seed`).
 * Run: npm run admin:create
 *
 * Required in `.env`: `DATABASE_URL`
 * Credentials: set `ADMIN_USERNAME` + `ADMIN_PASSWORD` (recommended), or `SEED_ADMIN_*` aliases.
 * See `.env.example` and `src/lib/admin-credentials.ts`.
 */
import { config } from "dotenv";
import { resolve } from "path";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import {
  describePasswordForLogs,
  resolveAdminCredentials,
} from "../src/lib/admin-credentials";

config({ path: resolve(process.cwd(), ".env") });
config({ path: resolve(process.cwd(), ".env.local"), override: true });

const prisma = new PrismaClient();

async function main() {
  if (!process.env.DATABASE_URL?.trim()) {
    console.error("Missing DATABASE_URL in .env — add your PostgreSQL connection string.");
    process.exit(1);
  }

  const { username, password } = resolveAdminCredentials();
  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.admin.upsert({
    where: { username },
    update: { password: passwordHash },
    create: {
      username,
      password: passwordHash,
    },
  });

  console.log("");
  console.log("Admin user saved to database.");
  console.log("  Login URL:  /admin/login  (e.g. http://localhost:3000/admin/login)");
  console.log(`  Username:   ${username}`);
  console.log(`  Password:   ${describePasswordForLogs(password)}`);
  console.log("");
  if (process.env.NODE_ENV !== "production") {
    console.log("For production: set ADMIN_PASSWORD (8+ chars) in hosting env and NODE_ENV=production.");
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
