import {
  BookOpen,
  Compass,
  Heart,
  LibraryBig,
  Sparkles,
  Telescope,
} from "lucide-react";
import PageHeading from "@/components/shared/PageHeading";

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
        <PageHeading
          level="h2"
          eyebrow="Choose your next chapter"
          title="Browse by Mood"
          description="From page-turning mysteries to ideas worth sharing, there is a shelf for every reader."
        />
      </div>

      <div className="grid auto-rows-fr gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map(({ name, note, Icon }) => (
          <article
            key={name}
            className="flex h-full items-center gap-4 rounded-2xl border bg-card p-5 transition-colors hover:bg-muted/50"
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
