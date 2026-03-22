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

/** Set SEED_DUMMY=0 to skip demo portfolio / contacts on empty DB */
const SEED_DUMMY = process.env.SEED_DUMMY !== "0";

const DEFAULT_SKILL_TREE: { title: string; items: string[] }[] = [
  {
    title: "Programming Languages",
    items: ["Go (Golang)", "Python"],
  },
  {
    title: "Backend Engineering",
    items: [
      "RESTful APIs",
      "Microservices Architecture",
      "API Authentication (JWT)",
      "Middleware",
      "CRUD Operations",
      "Database Schema Design",
      "Error Handling & Logging",
    ],
  },
  {
    title: "Databases",
    items: ["PostgreSQL", "MongoDB"],
  },
  {
    title: "Cloud & DevOps",
    items: ["AWS (EC2, S3)", "Docker", "Kubernetes", "Terraform", "CI/CD (GitHub Actions)"],
  },
  {
    title: "Automation",
    items: ["n8n Workflow Automation"],
  },
  {
    title: "Developer Tools",
    items: ["Git", "GitHub", "Linux (CLI)", "Postman"],
  },
  {
    title: "Core Concepts",
    items: ["Data Structures & Algorithms", "System Design", "Distributed Systems Fundamentals"],
  },
];

/** Demo portfolio — images from picsum (requires picsum in next.config remotePatterns). */
const DUMMY_PORTFOLIO: {
  title: string;
  description: string;
  image: string;
  link: string | null;
  galleryCaption?: string | null;
  videoUrl?: string | null;
}[] = [
  {
    title: "API Gateway & Auth Service",
    description:
      "Dummy project: JWT-based auth, rate limiting, and OpenAPI docs. Replace this text in admin — this seed data is only for local UI testing.",
    image: "https://picsum.photos/seed/gateway/1200/750",
    link: "https://github.com",
    galleryCaption: "JWT · rate limits · OpenAPI",
  },
  {
    title: "Realtime Events Pipeline",
    description:
      "Dummy: WebSocket fan-out, Redis streams, and idempotent workers. Use admin to add your real projects later.",
    image: "https://picsum.photos/seed/pipeline/1200/750",
    link: "https://github.com",
    galleryCaption: "WebSockets · Redis streams",
  },
  {
    title: "Data Sync & ETL",
    description:
      "Dummy: Scheduled jobs, Prisma + Postgres, dead-letter queue for failures. Portfolio card layout + gallery test.",
    image: "https://picsum.photos/seed/etl/1200/750",
    link: null,
    galleryCaption: null,
  },
  {
    title: "Admin Dashboard",
    description:
      "Dummy: CRUD UI, role checks, and audit logs — demonstrates two-column works grid on desktop.",
    image: "https://picsum.photos/seed/admin/1200/750",
    link: "https://example.com",
    galleryCaption: "CRUD · audit trail",
  },
];

const DUMMY_CONTACTS = [
  {
    name: "Alex Rivera",
    email: "alex.dummy@example.com",
    role: "I have a project",
    message:
      "Hi — this is a dummy contact row for testing the admin inbox. You can delete it from Admin → Contacts.",
  },
  {
    name: "Sam Chen",
    email: "recruiter.dummy@example.com",
    role: "I am a recruiter",
    message:
      "Sample recruiter message. Checking that the contacts table and list view work end-to-end.",
  },
];

async function seedSkillTree() {
  const count = await prisma.skillCategory.count();
  if (count > 0) return;

  let order = 0;
  for (const block of DEFAULT_SKILL_TREE) {
    await prisma.skillCategory.create({
      data: {
        title: block.title,
        sortOrder: order,
        items: {
          create: block.items.map((label, i) => ({
            label,
            sortOrder: i,
          })),
        },
      },
    });
    order += 1;
  }
  console.log(`Seeded ${DEFAULT_SKILL_TREE.length} skill categories.`);
}

async function seedDummyPortfolio() {
  if (!SEED_DUMMY) return;
  const n = await prisma.portfolio.count();
  if (n > 0) {
    console.log("Skipping dummy portfolio (table already has rows).");
    return;
  }
  for (const row of DUMMY_PORTFOLIO) {
    await prisma.portfolio.create({
      data: {
        title: row.title,
        description: row.description,
        image: row.image,
        link: row.link,
        galleryCaption: row.galleryCaption ?? null,
        videoUrl: row.videoUrl ?? null,
      },
    });
  }
  console.log(`Seeded ${DUMMY_PORTFOLIO.length} dummy portfolio items (picsum images).`);
}

async function seedDummyContacts() {
  if (!SEED_DUMMY) return;
  const n = await prisma.contact.count();
  if (n > 0) {
    console.log("Skipping dummy contacts (table already has rows).");
    return;
  }
  for (const row of DUMMY_CONTACTS) {
    await prisma.contact.create({ data: row });
  }
  console.log(`Seeded ${DUMMY_CONTACTS.length} dummy contact messages.`);
}

async function seedDummySocialLinks() {
  if (!SEED_DUMMY) return;
  const social = await prisma.social.findFirst();
  if (!social) return;
  if (social.github || social.linkedin) {
    console.log("Skipping dummy social links (already set).");
    return;
  }
  await prisma.social.update({
    where: { id: social.id },
    data: {
      github: "https://github.com/octocat",
      linkedin: "https://www.linkedin.com",
      instagram: "https://www.instagram.com",
      twitter: "https://twitter.com",
    },
  });
  console.log("Filled dummy social URLs (edit in Admin → Social).");
}

async function main() {
  const { username: ADMIN_USER, password: ADMIN_PASS } = resolveAdminCredentials();
  const passwordHash = await bcrypt.hash(ADMIN_PASS, 12);

  await prisma.admin.upsert({
    where: { username: ADMIN_USER },
    update: { password: passwordHash },
    create: {
      username: ADMIN_USER,
      password: passwordHash,
    },
  });

  const defaultHero =
    "For any queries contact me at parthbhardwaj2579@gmail.com";
  const aboutCount = await prisma.about.count();
  if (aboutCount === 0) {
    await prisma.about.create({
      data: {
        content:
          "I build reliable APIs, data pipelines, and backend systems. Focused on performance, security, and maintainability. (Tip: this paragraph is editable in Admin → About — the line below is dummy seed text for layout testing.)",
        heroTagline: defaultHero,
        contactCaption: defaultHero,
      },
    });
  }

  const socialCount = await prisma.social.count();
  if (socialCount === 0) {
    await prisma.social.create({
      data: {},
    });
  }

  await seedSkillTree();
  await seedDummySocialLinks();
  await seedDummyPortfolio();
  await seedDummyContacts();

  console.log("Seed complete.");
  console.log(`Admin username: ${ADMIN_USER}`);
  console.log(`Admin password: ${describePasswordForLogs(ADMIN_PASS)}`);
  if (process.env.NODE_ENV !== "production") {
    console.log("Change credentials via .env (ADMIN_*) and re-run seed or admin:create for production.");
  }
  if (SEED_DUMMY) {
    console.log(
      "Dummy data: portfolio + contacts only when those tables were empty. Set SEED_DUMMY=0 to skip next time."
    );
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
