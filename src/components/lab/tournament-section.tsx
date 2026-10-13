import { SectionHeading } from "./section-heading";

/**
 * GolfAI sends `X-Frame-Options: DENY` on the tournament page itself, so a
 * direct iframe of /t/pgti/india-2026 stays blank. The /embed documents are
 * published with `frame-ancestors *` and can be shown on this site.
 */
const FRAMES: { src: string; title: string; height: number }[] = [
  { src: "https://apitest.golfai.in/t/pgti/india-2026/entries/embed", title: "Field", height: 420 },
  { src: "https://apitest.golfai.in/t/pgti/india-2026/draw/1/embed", title: "Draw — Round 1", height: 720 },
  { src: "https://apitest.golfai.in/t/pgti/india-2026/leaderboard/embed", title: "Standings", height: 520 },
  { src: "https://apitest.golfai.in/t/pgti/india-2026/results/embed", title: "Results", height: 420 },
  { src: "https://apitest.golfai.in/t/pgti/india-2026/prizes/embed", title: "Prize money", height: 420 },
  { src: "https://apitest.golfai.in/t/pgti/india-2026/media/embed", title: "Gallery", height: 420 },
];

export function TournamentSection() {
  return (
    <section id="india" className="relative py-24 sm:py-32" aria-label="India">
      <div className="container-x">
        <SectionHeading
          index="09"
          label="Live"
          title="India"
          description="PGTI India 2026 at Riverbend Golf Links, Pune. Scores update as groups finish the round."
        />
        <div className="mt-12 flex flex-col gap-6">
          {FRAMES.map((frame) => (
            <iframe
              key={frame.src}
              src={frame.src}
              title={frame.title}
              width="100%"
              height={frame.height}
              style={{ border: 0 }}
              loading="lazy"
              className="w-full rounded-2xl bg-white"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
