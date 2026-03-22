export function SectionHeading({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div>
      <h2 className="font-display text-3xl tracking-tight md:text-4xl">{title}</h2>
      {subtitle ? <p className="mt-2 max-w-lg text-sm text-muted">{subtitle}</p> : null}
    </div>
  );
}
