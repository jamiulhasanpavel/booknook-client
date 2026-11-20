import {
  BookOpen,
  Compass,
  Heart,
  LibraryBig,
  Sparkles,
  Telescope,
} from "lucide-react";

const categories = [
  { name: "Fiction", note: "Stories to get lost in", Icon: BookOpen },
  { name: "Mystery", note: "Follow every clue", Icon: Compass },
  { name: "Romance", note: "Stories from the heart", Icon: Heart },
  { name: "Non-fiction", note: "Ideas from real life", Icon: LibraryBig },
  { name: "Fantasy", note: "Worlds beyond our own", Icon: Sparkles },
  { name: "Science Fiction", note: "Imagine what comes next", Icon: Telescope },
];

export default function TopCategories() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-[0.15em] text-primary">
          Choose your next chapter
        </p>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
          Browse by Mood
        </h2>
        <p className="mt-2 text-muted-foreground">
          From page-turning mysteries to ideas worth sharing, there is a shelf
          for every reader.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map(({ name, note, Icon }) => (
          <article
            key={name}
            className="flex items-center gap-4 rounded-2xl border bg-card p-5 transition-colors hover:bg-muted/50"
          >
            <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Icon aria-hidden="true" className="size-6" />
            </span>
            <div>
              <h3 className="font-semibold">{name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{note}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
