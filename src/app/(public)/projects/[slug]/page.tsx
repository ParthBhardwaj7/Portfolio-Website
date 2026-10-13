import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPublicPortfolio } from "@/lib/public-data";
import { splitList } from "@/lib/lab/normalize";
import { FadeIn } from "@/components/lab/fade-in";

export const revalidate = 60;

type Params = { slug: string };

export async function generateStaticParams(): Promise<Params[]> {
  const projects = await getPublicPortfolio();
  return projects
    .filter((p) => p.slug)
    .map((p) => ({ slug: p.slug as string }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = params;
  const projects = await getPublicPortfolio();
  const project = projects.find((p) => p.slug === slug);
  if (!project) return { title: "Project not found" };
  return {
    title: project.title,
    description: project.description.slice(0, 160),
    openGraph: {
      title: `${project.title} — Parth Bhardwaj`,
      description: project.description.slice(0, 200),
      ...(project.image ? { images: [{ url: project.image }] } : {}),
    },
  };
}

function Section({
  overline,
  title,
  body,
  delay = 0,
}: {
  overline: string;
  title: string;
  body: string;
  delay?: number;
}) {
  return (
    <FadeIn delay={delay} className="max-w-3xl">
      <p className="flex items-center gap-3 font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
        <span className="text-copper">{overline}</span>
        <span className="h-px w-8 bg-line-strong" />
      </p>
      <h2 className="mt-3 font-display text-2xl font-medium tracking-tight sm:text-3xl">{title}</h2>
      <p className="mt-4 whitespace-pre-line text-[0.95rem] leading-[1.85] text-muted-foreground">
        {body}
      </p>
    </FadeIn>
  );
}

export default async function ProjectDetailPage({ params }: { params: Params }) {
  const { slug } = params;
  const projects = await getPublicPortfolio();
  const project = projects.find((p) => p.slug === slug);
  if (!project) notFound();

  const tech = splitList(project.techStack);
  const liveHref = project.liveUrl || null;
  const githubHref = project.link || null;
  const screenshots = [
    ...(project.image ? [{ id: "cover", url: project.image, caption: null as string | null }] : []),
    ...project.images.map((img) => ({ id: img.id, url: img.url, caption: img.caption })),
  ];

  return (
    <div className="container-x pb-10 pt-28 sm:pt-36">
      <article className="relative">
        {/* Hero */}
        <header>
          <FadeIn>
            <Link
              href="/#work"
              className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-copper"
            >
              <span aria-hidden>←</span> All work
            </Link>
            <h1 className="mt-6 font-display text-4xl font-medium tracking-tight sm:text-6xl">
              {project.title}
            </h1>
          </FadeIn>
          {tech.length > 0 && (
            <FadeIn delay={0.1}>
              <div className="mt-6 flex flex-wrap gap-1.5">
                {tech.map((t) => (
                  <span
                    key={t}
                    className="rounded-full border border-line px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </FadeIn>
          )}
          {(liveHref || githubHref) && (
            <FadeIn delay={0.15}>
              <div className="mt-8 flex flex-wrap gap-3">
                {liveHref && (
                  <a
                    href={liveHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-2.5 text-sm font-medium text-background transition-colors hover:bg-copper"
                  >
                    Visit site <span aria-hidden>↗</span>
                  </a>
                )}
                {githubHref && (
                  <a
                    href={githubHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border border-line px-6 py-2.5 text-sm transition-colors hover:border-copper hover:text-copper"
                  >
                    View source <span aria-hidden>↗</span>
                  </a>
                )}
              </div>
            </FadeIn>
          )}
        </header>

        {/* Overview */}
        <div className="mt-16 space-y-16">
          <Section overline="01" title="What this is" body={project.description} delay={0.1} />

          {project.problem && (
            <Section overline="02 — Problem" title="The problem" body={project.problem} />
          )}
          {project.solution && (
            <Section overline="03 — Solution" title="The solution" body={project.solution} />
          )}
          {project.architecture && (
            <Section
              overline="04 — Architecture"
              title="How it's built"
              body={project.architecture}
            />
          )}

          {/* Screenshots */}
          {screenshots.length > 0 && (
            <FadeIn className="max-w-4xl">
              <p className="flex items-center gap-3 font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
                <span className="text-copper">05 — Screenshots</span>
                <span className="h-px w-8 bg-line-strong" />
              </p>
              <div className="mt-6 grid gap-6 sm:grid-cols-2">
                {screenshots.map((shot, i) => (
                  <FadeIn key={shot.id} delay={i * 0.06}>
                    <figure className="overflow-hidden rounded-xl border border-line bg-surface-2">
                      <div className="relative aspect-[16/10]">
                        <Image
                          src={shot.url}
                          alt={shot.caption ?? `${project.title} screenshot ${i + 1}`}
                          fill
                          className="object-cover object-top"
                          sizes="(max-width: 640px) 100vw, 45vw"
                        />
                      </div>
                      {shot.caption && (
                        <figcaption className="px-4 py-3 font-mono text-xs text-muted-foreground">
                          {shot.caption}
                        </figcaption>
                      )}
                    </figure>
                  </FadeIn>
                ))}
              </div>
            </FadeIn>
          )}
        </div>
      </article>
    </div>
  );
}
