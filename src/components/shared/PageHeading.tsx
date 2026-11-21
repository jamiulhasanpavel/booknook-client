type PageHeadingProps = {
  level?: "h1" | "h2";
  eyebrow?: string;
  title: string;
  description?: string;
  className?: string;
};

export default function PageHeading({
  level = "h1",
  eyebrow,
  title,
  description,
  className,
}: PageHeadingProps) {
  const Heading = level;

  return (
    <div className={`grid gap-2 ${className ?? ""}`}>
      {eyebrow ? (
        <p className="text-sm font-semibold uppercase tracking-[0.15em] text-primary">
          {eyebrow}
        </p>
      ) : null}
      <Heading className="font-heading text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
        {title}
      </Heading>
      {description ? (
        <p className="text-base leading-7 text-muted-foreground">
          {description}
        </p>
      ) : null}
    </div>
  );
}
