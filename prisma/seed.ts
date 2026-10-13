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

/**
 * Real content snapshot — synced 2026-10-03 from the production portfolio
 * (parthbhardwaj.com public APIs) and verified GitHub data
 * (github.com/ParthBhardwaj7). Nothing below is invented; edit in Admin.
 */

const REAL_ABOUT = {
  content:
    "Backend & AI Engineer focused on building scalable backend systems and intelligent, data-driven applications using Go (Golang), Node.js, and Python. Experienced in designing REST APIs and microservices architectures, with hands-on exposure to Docker, CI/CD pipelines, and cloud-based deployments.\n\nSkilled in developing database-driven systems using PostgreSQL and MongoDB, with a strong focus on performance, system design, and maintainability. Interested in integrating AI and automation into backend services to build efficient, production-ready systems.",
  profileImage:
    "https://res.cloudinary.com/dof7reunt/image/upload/v1775911145/ml_default/r5xiaxhudb0skbsobvng.png",
  heroTagline: "Hello, I'm Parth Bhardwaj ⚡",
  contactCaption: "Contact me at parthbhardwaj2579@gmail.com",
  resumeUrl:
    "https://res.cloudinary.com/dof7reunt/raw/upload/v1777883022/ml_default/vuqflwvivdylihglbpg2",
};

const REAL_SOCIAL = {
  github: "https://github.com/ParthBhardwaj7",
  linkedin: "https://www.linkedin.com/in/parthbhardwaj7/",
  instagram: "https://www.instagram.com/parthbhardwaj93/",
  twitter: "https://x.com/Parthbhardwaj95",
};

const REAL_SKILL_TREE: { title: string; items: string[] }[] = [
  {
    title: "Cloud & DevOps",
    items: ["Docker", "Kubernetes", "AWS", "GitHub Actions", "Terraform"],
  },
  {
    title: "Programming Languages",
    items: ["Go", "Python", "React"],
  },
  {
    title: "Databases",
    items: ["PostgreSQL", "MongoDB"],
  },
  {
    title: "Automation",
    items: ["n8n", "OpenClaw"],
  },
  {
    title: "Developer Tools",
    items: ["Git", "GitHub", "Postman", "Linux / Ubuntu CLI"],
  },
  {
    title: "AI & Emerging Tech",
    items: ["MCP (Model Context Protocol)", "LLM Integration", "AI Orchestration"],
  },
];

const REAL_PORTFOLIO: {
  title: string;
  slug: string;
  description: string;
  techStack: string;
  image: string;
  link: string | null;
  liveUrl: string | null;
  problem: string;
  solution: string;
  architecture: string;
  featured: boolean;
  sortOrder: number;
  images: { url: string; caption?: string }[];
}[] = [
  {
    title: "APNCODIX",
    slug: "apncodix",
    description:
      "Full-Stack Production Platform — a complete web platform built from scratch with a focus on performance, scalability, and real-world production practices. Secured with JWT authentication, validation, and rate limiting, deployed on a VPS with Docker + Nginx and automated through CI/CD.",
    techStack:
      "Next.js 14, React, TypeScript, Tailwind CSS, Radix UI, NestJS, PostgreSQL, Prisma, Docker, Nginx, GitHub Actions, Cloudinary, Razorpay",
    image:
      "https://res.cloudinary.com/dof7reunt/image/upload/v1775921012/ml_default/mwpfxmhzzurk809ck9r7.png",
    link: "https://apncodix.com/",
    liveUrl: "https://apncodix.com/",
    problem:
      "A production platform needs more than a working demo: real users mean real payments, media uploads, and traffic — so security (auth, validation, rate limiting), HTTPS, and repeatable deployments have to be designed in from day one.",
    solution:
      "A full-stack platform split into a Next.js 14 + TypeScript frontend and a NestJS backend on PostgreSQL (Prisma), with JWT-based authentication, request validation, and rate limiting protecting every route. Media runs through Cloudinary and payments through Razorpay. Performance and SEO were tuned until the site scored 100 on Google PageSpeed Insights.",
    architecture:
      "Next.js 14 / React / TypeScript frontend with Tailwind + Radix UI → NestJS REST API with JWT auth, validation and rate limiting → PostgreSQL via Prisma → Dockerized services behind Nginx with Let's Encrypt HTTPS on a VPS → GitHub Actions CI/CD for automated deployments; Cloudinary for media, Razorpay for payments.",
    featured: true,
    sortOrder: 0,
    images: [
      {
        url: "https://res.cloudinary.com/dof7reunt/image/upload/v1775922490/ml_default/wmthy20eb6ut1zsmwryo.png",
      },
      {
        url: "https://res.cloudinary.com/dof7reunt/image/upload/v1775922515/ml_default/lq3zk8q8bdevrhkhasr2.png",
      },
    ],
  },
  {
    title: "AI-PM",
    slug: "ai-pm",
    description:
      "AI-powered product ideation tool that transforms raw ideas into structured, actionable insights. Built with MCP (Tambo) to generate reusable, scalable Next.js UI components, and Groq-powered LLM integration for product breakdowns, use cases, and feature suggestions.",
    techStack: "Next.js, MCP (Model Context Protocol), Tambo, Groq, LLM Integration, TypeScript",
    image:
      "https://res.cloudinary.com/dof7reunt/image/upload/v1775923864/ml_default/srvlzlgfttfhwc2vhhvq.png",
    link: "https://ai-pm-one.vercel.app/",
    liveUrl: "https://ai-pm-one.vercel.app/",
    problem:
      "Early product thinking is unstructured: raw ideas stay vague, and turning them into breakdowns, use cases, and feature suggestions is slow manual work.",
    solution:
      "An AI ideation tool that processes user input through an LLM (Groq) to produce structured product breakdowns, use cases, and feature suggestions. The frontend itself is generated through MCP (Tambo), producing reusable and scalable Next.js UI components and cutting manual frontend effort.",
    architecture:
      "Next.js UI (generated via MCP/Tambo component automation) → user input captured client-side → Groq-hosted LLM processes prompts into structured insights → results rendered as component-driven views. Deployed on Vercel.",
    featured: false,
    sortOrder: 1,
    images: [
      {
        url: "https://res.cloudinary.com/dof7reunt/image/upload/v1775924072/ml_default/fihfxx32rqsjjzmmjdr5.png",
      },
      {
        url: "https://res.cloudinary.com/dof7reunt/image/upload/v1775924083/ml_default/m2k7z3taorzo7d0kagdn.png",
      },
    ],
  },
  {
    title: "Infrastructure Monitoring Stack",
    slug: "infrastructure-monitoring-stack",
    description:
      "Dockerized observability stack using Prometheus and Grafana to monitor a Go application via its /metrics endpoint — with scrape jobs, dashboards for request rates and error counts, and alert rules for incident detection, all deployed via Docker Compose.",
    techStack: "Go, Prometheus, Grafana, Docker Compose, Observability",
    image:
      "https://res.cloudinary.com/dof7reunt/image/upload/v1777119261/ml_default/dbsumrwigtf9aah68ute.png",
    link: "https://github.com/ParthBhardwaj7/GO-Lang/tree/main/webserver",
    liveUrl: null,
    problem:
      "A Go service exposes rich runtime metrics at /metrics, but without scraping, visualization, and alerting, those signals can't detect incidents — request-rate spikes and error surges would go unnoticed.",
    solution:
      "A reproducible, production-like monitoring environment: Prometheus scrape jobs collect the Go app's metrics, Grafana dashboards visualize request rates and error counts, and alert rules fire on incident conditions. Everything ships as one Docker Compose setup.",
    architecture:
      "Go application exposing /metrics → Prometheus scrape jobs (time-series collection) → Grafana dashboards (request rates, error counts) → Alertmanager-style alert rules for incident detection → entire stack defined and deployed via Docker Compose.",
    featured: false,
    sortOrder: 2,
    images: [
      {
        url: "https://res.cloudinary.com/dof7reunt/image/upload/v1777119342/ml_default/p4bmpic0zewoqkej8yep.png",
      },
      {
        url: "https://res.cloudinary.com/dof7reunt/image/upload/v1777119358/ml_default/kdnorr4dprlijvsh4rgh.png",
      },
    ],
  },
];

/**
 * Verified milestones only — dates come from GitHub repo creation dates
 * (api.github.com/users/ParthBhardwaj7), certification issue dates, and the
 * merged pull request record. Update in Admin → Experience.
 */
const REAL_EXPERIENCE: {
  year: string;
  title: string;
  org?: string;
  type: string;
  description: string;
  technologies?: string;
  url?: string;
  sortOrder: number;
}[] = [
  {
    year: "2023",
    title: "Started building in public",
    org: "github.com/ParthBhardwaj7",
    type: "milestone",
    description:
      "Joined GitHub (July 2023) and began shipping learning projects — Python, ML experiments, and cloud fundamentals.",
    sortOrder: 0,
  },
  {
    year: "2025",
    title: "Cloud & DevOps foundations",
    org: "Independent study",
    type: "milestone",
    description:
      "Deep-dived the deployment stack: AWS projects (Jan), Docker labs (Mar), and daily Terraform practice (Apr) — documented openly in dedicated repositories.",
    technologies: "AWS, Docker, Terraform",
    sortOrder: 1,
  },
  {
    year: "2025",
    title: "Full-stack & AI projects",
    org: "Independent projects",
    type: "project",
    description:
      "Shipped agentivesite (TypeScript), an end-to-end book recommendation system, and laptop price prediction (ML) — moving from notebooks to deployed applications.",
    technologies: "TypeScript, Python, ML",
    sortOrder: 2,
  },
  {
    year: "2026 · Feb",
    title: "AI-PM — LLM product ideation tool",
    org: "Independent project",
    type: "project",
    description:
      "Built and deployed an AI-powered ideation tool: MCP (Tambo) for UI component generation and Groq LLM integration for structured product insights.",
    technologies: "Next.js, MCP, Groq, LLM",
    url: "https://ai-pm-one.vercel.app/",
    sortOrder: 3,
  },
  {
    year: "2026 · Apr",
    title: "AWS Academy Cloud Architecting + Cloud Practitioner Essentials",
    org: "AWS Academy / AWS Skill Builder",
    type: "certification",
    description:
      "Earned both AWS credentials within two days: Cloud Practitioner Essentials (23 April) and Cloud Architecting (24 April) — VPC design, compute, storage, HA, and well-architected practices.",
    technologies: "AWS, VPC, EC2, RDS",
    url: "https://www.credly.com/go/PVrHemgC",
    sortOrder: 4,
  },
  {
    year: "2026 · May",
    title: "Systems season: Go, shorteners, and agent marketplaces",
    org: "Independent projects",
    type: "project",
    description:
      "Shipped URL-Shortener-Analytics-Platform (Go, built through every deployment phase), FOCUSFLOW (Flutter execution engine), and DashPin — a marketplace for AI agents.",
    technologies: "Go, TypeScript, Flutter",
    url: "https://github.com/ParthBhardwaj7/URL-Shortener-Analytics-Platform",
    sortOrder: 5,
  },
  {
    year: "2026 · Jul",
    title: "AI-Memory-OS",
    org: "Independent project",
    type: "project",
    description:
      "Built a persistent memory system for AI — 'your second brain that doesn't forget' — implemented in Python.",
    technologies: "Python, AI Memory",
    url: "https://github.com/ParthBhardwaj7/AI-Memory-OS",
    sortOrder: 6,
  },
  {
    year: "2026 · Aug",
    title: "First merged open-source contribution",
    org: "topoteretes/cognee",
    type: "opensource",
    description:
      "PR #3274 'fix(serve): attempt health check with cached creds before refresh' was merged into cognee, the open-source AI memory platform. A follow-up feature PR (#3458, LangChain + LlamaIndex memory sources) is under review.",
    technologies: "Python, Open Source",
    url: "https://github.com/topoteretes/cognee/pull/3274",
    sortOrder: 7,
  },
  {
    year: "2026 · Sep",
    title: "AI infrastructure research",
    org: "Forks & study",
    type: "milestone",
    description:
      "Actively working inside the ecosystems of MLflow, KServe, Kubernetes, etcd, and Prometheus — forking, reading, and preparing upstream contributions.",
    technologies: "MLflow, KServe, Kubernetes, etcd, Prometheus",
    sortOrder: 8,
  },
];

const REAL_CERTIFICATIONS = [
  {
    title: "AWS Academy Cloud Architecting",
    issuer: "AWS Academy",
    issueDate: "24-04-2026",
    imageUrl:
      "https://res.cloudinary.com/dof7reunt/image/upload/v1777029669/ml_default/uijgtew4qdyiyyaaqlqg.png",
    pdfUrl: null as string | null,
    credentialUrl: "https://www.credly.com/go/PVrHemgC",
    sortOrder: 0,
  },
  {
    title: "AWS Cloud Practitioner Essentials",
    issuer: "AWS Skill Builder",
    issueDate: "23 April 2026",
    imageUrl:
      "https://res.cloudinary.com/dof7reunt/image/upload/v1777029945/ml_default/xt6mhqzwbilthh8ifew3.png",
    pdfUrl: null as string | null,
    credentialUrl: null as string | null,
    sortOrder: 1,
  },
];

async function seedAbout() {
  const existing = await prisma.about.findFirst();
  if (existing) {
    // Keep admin-editable fields if already set; fill gaps only.
    await prisma.about.update({
      where: { id: existing.id },
      data: {
        content: existing.content?.trim() || REAL_ABOUT.content,
        profileImage: existing.profileImage ?? REAL_ABOUT.profileImage,
        heroTagline: existing.heroTagline?.trim() || REAL_ABOUT.heroTagline,
        contactCaption: existing.contactCaption?.trim() || REAL_ABOUT.contactCaption,
        resumeUrl: existing.resumeUrl ?? REAL_ABOUT.resumeUrl,
      },
    });
  } else {
    await prisma.about.create({ data: REAL_ABOUT });
  }
}

async function seedSocial() {
  const social = await prisma.social.findFirst();
  if (!social) {
    await prisma.social.create({ data: REAL_SOCIAL });
    return;
  }
  if (!social.github && !social.linkedin) {
    await prisma.social.update({ where: { id: social.id }, data: REAL_SOCIAL });
  }
}

async function seedSkills() {
  const count = await prisma.skillCategory.count();
  if (count > 0) return;
  let order = 0;
  for (const block of REAL_SKILL_TREE) {
    await prisma.skillCategory.create({
      data: {
        title: block.title,
        sortOrder: order,
        items: { create: block.items.map((label, i) => ({ label, sortOrder: i })) },
      },
    });
    order += 1;
  }
  console.log(`Seeded ${REAL_SKILL_TREE.length} real skill categories.`);
}

async function seedPortfolio() {
  const n = await prisma.portfolio.count();
  if (n > 0) {
    console.log("Portfolio not empty — leaving rows untouched (edit in Admin).");
    return;
  }
  for (const p of REAL_PORTFOLIO) {
    await prisma.portfolio.create({
      data: {
        ...p,
        images: {
          create: p.images.map((img, i) => ({
            url: img.url,
            caption: img.caption ?? null,
            sortOrder: i,
          })),
        },
      },
    });
  }
  console.log(`Seeded ${REAL_PORTFOLIO.length} real portfolio projects.`);
}

async function seedExperience() {
  const n = await prisma.experience.count();
  if (n > 0) return;
  for (const e of REAL_EXPERIENCE) {
    await prisma.experience.create({ data: e });
  }
  console.log(`Seeded ${REAL_EXPERIENCE.length} verified timeline entries.`);
}

async function seedCertifications() {
  const n = await prisma.certification.count();
  if (n > 0) return;
  for (const c of REAL_CERTIFICATIONS) {
    await prisma.certification.create({ data: c });
  }
  console.log(`Seeded ${REAL_CERTIFICATIONS.length} real certifications.`);
}

async function main() {
  const { username: ADMIN_USER, password: ADMIN_PASS } = resolveAdminCredentials();
  const passwordHash = await bcrypt.hash(ADMIN_PASS, 12);

  await prisma.admin.upsert({
    where: { username: ADMIN_USER },
    update: { password: passwordHash },
    create: { username: ADMIN_USER, password: passwordHash },
  });

  await seedAbout();
  await seedSocial();
  await seedSkills();
  await seedPortfolio();
  await seedExperience();
  await seedCertifications();

  console.log("Seed complete (real content snapshot).");
  console.log(`Admin username: ${ADMIN_USER}`);
  console.log(`Admin password: ${describePasswordForLogs(ADMIN_PASS)}`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
