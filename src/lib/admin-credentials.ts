/**
 * Shared by `prisma/seed.ts` and `scripts/create-admin.ts`.
 * Set credentials only via `.env` — see `.env.example`.
 *
 * Precedence: `ADMIN_USERNAME` / `ADMIN_PASSWORD` → then `SEED_ADMIN_USERNAME` / `SEED_ADMIN_PASSWORD`.
 * In production (`NODE_ENV=production`), `ADMIN_PASSWORD` or `SEED_ADMIN_PASSWORD` is required (min 8 chars).
 * In development, if no password is set, a default dev password is used (with a console warning).
 */

const DEFAULT_DEV_PASSWORD = "changeme123";
const MIN_PASSWORD_LENGTH_PRODUCTION = 8;

function nonempty(s: string | undefined): string | undefined {
  if (s === undefined) return undefined;
  const t = s.trim();
  return t.length === 0 ? undefined : t;
}

function isProductionNodeEnv(): boolean {
  return process.env.NODE_ENV === "production";
}

export function resolveAdminCredentials(): { username: string; password: string } {
  const username =
    nonempty(process.env.ADMIN_USERNAME) ??
    nonempty(process.env.SEED_ADMIN_USERNAME) ??
    "admin";

  const fromEnv =
    nonempty(process.env.ADMIN_PASSWORD) ?? nonempty(process.env.SEED_ADMIN_PASSWORD);

  if (fromEnv !== undefined) {
    if (isProductionNodeEnv() && fromEnv.length < MIN_PASSWORD_LENGTH_PRODUCTION) {
      throw new Error(
        `Admin password must be at least ${MIN_PASSWORD_LENGTH_PRODUCTION} characters when NODE_ENV=production (set ADMIN_PASSWORD or SEED_ADMIN_PASSWORD in .env).`
      );
    }
    return { username, password: fromEnv };
  }

  if (isProductionNodeEnv()) {
    throw new Error(
      "Set ADMIN_PASSWORD (or SEED_ADMIN_PASSWORD) in your environment — min 8 characters. Default passwords are not allowed when NODE_ENV=production."
    );
  }

  console.warn(
    "[admin-credentials] No ADMIN_PASSWORD in .env — using default dev password. Set ADMIN_PASSWORD before any production deploy."
  );
  return { username, password: DEFAULT_DEV_PASSWORD };
}

export function describePasswordForLogs(password: string): string {
  if (isProductionNodeEnv()) {
    return "(hidden — stored value from ADMIN_PASSWORD / SEED_ADMIN_PASSWORD)";
  }
  return password;
}
