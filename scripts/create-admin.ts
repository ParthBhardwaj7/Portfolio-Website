/**
 * Creates or updates the admin user in PostgreSQL (same logic as prisma seed admin part).
 * Run: npm run admin:create
 *
 * Credentials from env (optional):
 *   SEED_ADMIN_USERNAME / SEED_ADMIN_PASSWORD  (same as seed)
 *   or ADMIN_USERNAME / ADMIN_PASSWORD
 */
import { config } from "dotenv";
import { resolve } from "path";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

config({ path: resolve(process.cwd(), ".env") });
config({ path: resolve(process.cwd(), ".env.local") });

const prisma = new PrismaClient();

const username =
  process.env.SEED_ADMIN_USERNAME?.trim() ||
  process.env.ADMIN_USERNAME?.trim() ||
  "admin";
const password =
  process.env.SEED_ADMIN_PASSWORD ||
  process.env.ADMIN_PASSWORD ||
  "changeme123";

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error("Missing DATABASE_URL in .env — add your PostgreSQL connection string.");
    process.exit(1);
  }

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
  console.log(`  Password:   ${password}`);
  console.log("");
  console.log("Change password after first login in production.");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
