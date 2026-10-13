import "server-only";

/**
 * Real GitHub data for the Open Source section.
 * Live data comes from the GitHub REST API (cached via Next.js ISR);
 * if the API is unreachable, a verified snapshot captured 2026-10-03
 * is served so the section never shows fabricated content.
 */

const GITHUB_USER = "ParthBhardwaj7";

export type GhPull = {
  repo: string;
  number: number;
  title: string;
  state: "open" | "closed";
  merged: boolean;
  url: string;
  createdAt: string;
  mergedAt: string | null;
};

export type GhRepo = {
  name: string;
  description: string | null;
  language: string | null;
  url: string;
  stars: number;
  fork: boolean;
  pushedAt: string;
};

export type GhProfile = {
  login: string;
  name: string;
  bio: string | null;
  avatarUrl: string;
  htmlUrl: string;
  publicRepos: number;
  followers: number;
};

export type GhSnapshot = {
  profile: GhProfile | null;
  pulls: GhPull[];
  repos: GhRepo[];
  ossForks: GhRepo[];
  source: "live" | "snapshot";
  fetchedAt: string;
};

/** Verified snapshot — github.com/ParthBhardwaj7, captured 2026-10-03. */
const SNAPSHOT: GhSnapshot = {
  source: "snapshot",
  fetchedAt: "2026-10-03T10:40:00Z",
  profile: {
    login: GITHUB_USER,
    name: "Parth Bhardwaj",
    bio: "AI & Cloud Enthusiast | Aspiring DevOps Engineer | Exploring how AI transforms Cloud & Automation",
    avatarUrl: "https://avatars.githubusercontent.com/u/138441221?v=4",
    htmlUrl: `https://github.com/${GITHUB_USER}`,
    publicRepos: 28,
    followers: 7,
  },
  pulls: [
    {
      repo: "topoteretes/cognee",
      number: 3274,
      title: "fix(serve): attempt health check with cached creds before refresh",
      state: "closed",
      merged: true,
      url: "https://github.com/topoteretes/cognee/pull/3274",
      createdAt: "2026-08-19T08:55:00Z",
      mergedAt: "2026-08-19T09:12:35Z",
    },
    {
      repo: "topoteretes/cognee",
      number: 3458,
      title: "feat(migration): add LangChain and LlamaIndex memory source",
      state: "closed",
      merged: false,
      url: "https://github.com/topoteretes/cognee/pull/3458",
      createdAt: "2026-09-20T00:00:00Z",
      mergedAt: null,
    },
  ],
  repos: [
    { name: "AI-Memory-OS", description: "Your Second Brain — it basically doesn't forget anything", language: "Python", url: "https://github.com/ParthBhardwaj7/AI-Memory-OS", stars: 0, fork: false, pushedAt: "2026-07-05" },
    { name: "DashPin", description: "Marketplace for AI Agents", language: "TypeScript", url: "https://github.com/ParthBhardwaj7/DashPin", stars: 0, fork: false, pushedAt: "2026-05-31" },
    { name: "URL-Shortener-Analytics-Platform", description: "Scalable URL shortener in Go, built through every phase of deployment", language: "Go", url: "https://github.com/ParthBhardwaj7/URL-Shortener-Analytics-Platform", stars: 0, fork: false, pushedAt: "2026-05-07" },
    { name: "FOCUSFLOW", description: "Not a task manager — an execution engine", language: "Dart", url: "https://github.com/ParthBhardwaj7/FOCUSFLOW", stars: 0, fork: false, pushedAt: "2026-05-29" },
    { name: "GO-Lang", description: "Go learning progress and projects (incl. the monitoring webserver)", language: "Go", url: "https://github.com/ParthBhardwaj7/GO-Lang", stars: 0, fork: false, pushedAt: "2026-04-25" },
    { name: "Portfolio-Website", description: "This portfolio", language: "TypeScript", url: "https://github.com/ParthBhardwaj7/Portfolio-Website", stars: 0, fork: false, pushedAt: "2026-08-08" },
    { name: "ai-pm", description: "AI-powered product ideation tool", language: "JavaScript", url: "https://github.com/ParthBhardwaj7/ai-pm", stars: 0, fork: false, pushedAt: "2026-02-11" },
    { name: "agentivesite", description: "TypeScript project", language: "TypeScript", url: "https://github.com/ParthBhardwaj7/agentivesite", stars: 0, fork: false, pushedAt: "2025-12-11" },
  ],
  ossForks: [
    { name: "mlflow", description: "The open source AI engineering platform for agents, LLMs, and ML models", language: "Python", url: "https://github.com/ParthBhardwaj7/mlflow", stars: 0, fork: true, pushedAt: "2026-09-22" },
    { name: "kserve", description: "Standardized distributed generative and predictive AI inference platform", language: "Go", url: "https://github.com/ParthBhardwaj7/kserve", stars: 0, fork: true, pushedAt: "2026-09-22" },
    { name: "cognee", description: "Open-source AI memory platform for agents", language: "Python", url: "https://github.com/ParthBhardwaj7/cognee", stars: 0, fork: true, pushedAt: "2026-06-25" },
    { name: "Flowise", description: "Build AI agents, visually", language: "TypeScript", url: "https://github.com/ParthBhardwaj7/Flowise", stars: 0, fork: true, pushedAt: "2026-06-23" },
    { name: "kubernetes", description: "Production-grade container scheduling and management — for contribution", language: "Go", url: "https://github.com/ParthBhardwaj7/kubernetes", stars: 0, fork: true, pushedAt: "2026-05-09" },
    { name: "etcd", description: "Distributed reliable key-value store — for contribution", language: "Go", url: "https://github.com/ParthBhardwaj7/etcd", stars: 0, fork: true, pushedAt: "2026-05-08" },
    { name: "prometheus", description: "The Prometheus monitoring system and time series database — for contribution", language: "Go", url: "https://github.com/ParthBhardwaj7/prometheus", stars: 0, fork: true, pushedAt: "2026-05-08" },
    { name: "agentmemory", description: "Persistent memory for AI coding agents", language: "Python", url: "https://github.com/ParthBhardwaj7/agentmemory", stars: 0, fork: true, pushedAt: "2026-06-22" },
  ],
};

async function ghFetch<T>(path: string): Promise<T | null> {
  try {
    const headers: Record<string, string> = {
      Accept: "application/vnd.github+json",
      "User-Agent": "portfolio-site",
    };
    if (process.env.GITHUB_TOKEN) {
      headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
    }
    const res = await fetch(`https://api.github.com${path}`, {
      headers,
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export async function getGithubSnapshot(): Promise<GhSnapshot> {
  const [profileRaw, pulls, repos] = await Promise.all([
    ghFetch<Record<string, unknown>>(`/users/${GITHUB_USER}`),
    ghFetch<{ items: (GhPull & { repository_url: string; pull_request?: { merged_at: string | null }; created_at: string; html_url: string; state: string })[] }>(
      `/search/issues?q=type:pr+author:${GITHUB_USER}&per_page=20`,
    ),
    ghFetch<Record<string, unknown>[]>(`/users/${GITHUB_USER}/repos?per_page=100&sort=pushed`),
  ]);

  if (!profileRaw && !pulls && !repos) {
    return SNAPSHOT;
  }

  // GitHub API returns snake_case — normalize before use. A rate-limit
  // error body is also JSON, so require a real login before trusting it.
  const profile: GhProfile | null =
    profileRaw && typeof profileRaw.login === "string"
      ? {
          login: profileRaw.login,
          name: typeof profileRaw.name === "string" ? profileRaw.name : "",
          bio: typeof profileRaw.bio === "string" ? profileRaw.bio : null,
          avatarUrl: typeof profileRaw.avatar_url === "string" ? profileRaw.avatar_url : "",
          htmlUrl:
            typeof profileRaw.html_url === "string"
              ? profileRaw.html_url
              : `https://github.com/${GITHUB_USER}`,
          publicRepos: Number(profileRaw.public_repos ?? 0),
          followers: Number(profileRaw.followers ?? 0),
        }
      : null;

  const rawRepos = Array.isArray(repos) ? repos : null;
  const repoList: GhRepo[] = rawRepos
    ? rawRepos.flatMap((r): GhRepo[] => {
        if (!r || typeof r.name !== "string") return [];
        return [
          {
            name: r.name,
            description: typeof r.description === "string" ? r.description : null,
            language: typeof r.language === "string" ? r.language : null,
            url:
              typeof r.html_url === "string"
                ? r.html_url
                : `https://github.com/${GITHUB_USER}/${r.name}`,
            stars: Number(r.stargazers_count ?? 0),
            fork: Boolean(r.fork),
            pushedAt: typeof r.pushed_at === "string" ? r.pushed_at : "",
          },
        ];
      })
    : SNAPSHOT.repos;
  const pullList = pulls?.items
    ? pulls.items.map((p) => ({
        repo: p.repository_url.split("/").slice(-2).join("/"),
        number: p.number,
        title: p.title,
        state: (p.state === "open" ? "open" : "closed") as "open" | "closed",
        merged: Boolean(p.pull_request?.merged_at),
        url: p.html_url,
        createdAt: p.created_at,
        mergedAt: p.pull_request?.merged_at ?? null,
      }))
    : SNAPSHOT.pulls;

  return {
    source: "live",
    fetchedAt: new Date().toISOString(),
    profile: profile ?? SNAPSHOT.profile,
    pulls: pullList,
    repos: repoList.filter((r) => !r.fork).slice(0, 8),
    ossForks: repoList.filter((r) => r.fork).slice(0, 8),
  };
}
