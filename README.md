# Portfolio website (Next.js + Prisma + PostgreSQL)

Full-stack personal portfolio with a **JWT-protected admin panel**, **PostgreSQL** via Prisma, **bcrypt** password hashing, **image uploads** (local dev or Cloudinary in production), and a **public site** with Framer Motion.

## Stack

- **Frontend:** Next.js 14 (App Router), Tailwind CSS, Framer Motion, next-themes  
- **Backend:** Next.js Route Handlers (`app/api/**`)  
- **Data:** Prisma ORM + PostgreSQL  
- **Auth:** JWT in **httpOnly** cookie (no third-party auth)

## Prerequisites

- Node.js 18+  
- PostgreSQL (local, Docker, or hosted: Neon, Supabase, Railway, etc.)

## Setup

1. **Clone / open the project** and install dependencies:

   ```bash
   npm install
   ```

2. **Environment variables**

   ```bash
   cp .env.example .env
   ```

   Edit `.env`:

   - `DATABASE_URL` — PostgreSQL connection string  
   - `JWT_SECRET` — at least 16 characters (use a strong random value in production)  
   - `NEXT_PUBLIC_APP_URL` — e.g. `http://localhost:3000` for local dev  
   - For **Vercel / serverless:** set `UPLOAD_PROVIDER=cloudinary` and fill Cloudinary keys (local disk is not persistent on Vercel).

3. **Database schema**

   ```bash
   npx prisma generate
   npx prisma migrate dev --name init
   ```

   (If you already have migrations, use `npx prisma migrate deploy` in CI/production.)

4. **Seed admin user + default rows** (or only admin — see below)

   ```bash
   npx prisma db seed
   ```

   **Admin only** (upserts user in DB — good when you only need login credentials):

   ```bash
   npm run admin:create
   ```

   Default admin (unless overridden by `SEED_ADMIN_USERNAME` / `SEED_ADMIN_PASSWORD`, or `ADMIN_USERNAME` / `ADMIN_PASSWORD` for `admin:create`):

   - Username: `admin`  
   - Password: `changeme123`  

   Change the password after first login in production.

5. **Run development server**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) for the portfolio and [http://localhost:3000/admin/login](http://localhost:3000/admin/login) for the admin panel.

6. **Production build (local check)**

   ```bash
   npm run build
   npm start
   ```

   `npm run build` expects `DATABASE_URL` (and `JWT_SECRET`) to be set so Prisma can run `prisma generate` and pages that load data can connect if needed.

## Scripts

| Command | Description |
|--------|-------------|
| `npm run dev` | Next.js dev server |
| `npm run build` | `prisma generate` + `next build` |
| `npm start` | Production server |
| `npm run lint` | ESLint |
| `npx prisma migrate dev` | Create/apply migrations (dev) |
| `npx prisma migrate deploy` | Apply migrations (production) |
| `npx prisma db seed` | Seed admin + singleton `About` / `Social` |
| `npm run admin:create` | Create/update **admin user only** in the database |
| `npx prisma studio` | Prisma Studio GUI |

## API overview

**Public**

- `GET /api/public/about` | `skills` | `portfolio` | `social`  
- `POST /api/contact` — contact form (validated, stored in DB)

**Auth**

- `POST /api/auth/login` — sets httpOnly cookie  
- `POST /api/auth/logout` — clears cookie  

**Admin (JWT required)**

- `GET`/`PUT /api/admin/about`  
- `GET`/`POST /api/admin/portfolio`, `PUT`/`DELETE /api/admin/portfolio/[id]`  
- `GET`/`POST /api/admin/skills`, `DELETE /api/admin/skills/[id]`  
- `GET`/`PUT /api/admin/social`  
- `GET /api/admin/contacts`, `DELETE /api/admin/contacts/[id]`  
- `POST /api/admin/upload` — `multipart/form-data` field `file`  

The public homepage reads data **directly from Prisma** in Server Components for speed; the same data is exposed via `/api/public/*` for consistency and testing.

## Deployment

### Vercel (app) + managed PostgreSQL

1. Push the repo to GitHub and import the project in [Vercel](https://vercel.com).  
2. Set environment variables in Vercel: `DATABASE_URL`, `JWT_SECRET`, `NEXT_PUBLIC_APP_URL`, and **Cloudinary** vars with `UPLOAD_PROVIDER=cloudinary`.  
3. Build command: `prisma generate && prisma migrate deploy && next build` (or run migrations once before/after first deploy).  
4. Use Neon, Supabase, or Railway for Postgres; allow SSL connection strings as required.

### Railway / Render (full Node app)

1. Create a **Web** service from this repo.  
2. Attach a **PostgreSQL** plugin or external DB; set `DATABASE_URL`.  
3. Set `JWT_SECRET`, `NEXT_PUBLIC_APP_URL`, and either local uploads on a **persistent volume** or Cloudinary (`UPLOAD_PROVIDER=cloudinary`).  
4. Start command: `npx prisma migrate deploy && npm start` (or run migrations in a release phase).

## Security notes

- Use a long, random `JWT_SECRET` in production.  
- Replace seeded admin credentials immediately in production.  
- Prefer **HTTPS** and `Secure` cookies (handled when `NODE_ENV=production`).  
- Consider rate limiting for `/api/auth/login` and `/api/contact` (e.g. Redis / Upstash) for public-facing deployments.

## Project structure (short)

- `prisma/schema.prisma` — database models  
- `prisma/migrations/` — SQL migrations  
- `prisma/seed.ts` — admin + defaults  
- `src/app/(public)/` — public portfolio UI  
- `src/app/admin/` — login + dashboard  
- `src/app/api/` — REST-style route handlers  
- `src/middleware.ts` — protects `/admin` except `/admin/login`  
- `src/lib/` — Prisma client, JWT, auth, uploads, validation  
- `public/uploads/` — local image storage (development / non-serverless)
