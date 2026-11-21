import { ArrowRight, BookOpen, HeartHandshake, Search } from "lucide-react";
import PageHeading from "@/components/shared/PageHeading";

const steps = [
  {
    number: "01",
    title: "Find your next read",
    description:
      "Explore books shared by readers and discover a story that speaks to you.",
    Icon: Search,
  },
  {
    number: "02",
    title: "Borrow or share",
    description:
      "Request a book you love, or list a finished favorite for someone else.",
    Icon: BookOpen,
  },
  {
    number: "03",
    title: "Pass the story on",
    description:
      "Enjoy your read, return it with care, and keep the community turning pages.",
    Icon: HeartHandshake,
  },
];

export default function HowItWorks() {
  return (
    <section className="bg-muted/40">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <PageHeading
            level="h2"
            eyebrow="Simple as turning a page"
            title="How Borrowing Works"
            description="A few easy steps bring readers and their next great book together."
          />
        </div>

        <div className="mt-10 grid auto-rows-fr items-stretch gap-5 md:grid-cols-3">
          {steps.map(({ number, title, description, Icon }, index) => (
            <article
              key={number}
              className="relative h-full rounded-2xl border bg-background p-6 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <span className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon aria-hidden="true" className="size-6" />
                </span>
                <span className="text-sm font-semibold tracking-widest text-muted-foreground/60">
                  {number}
                </span>
              </div>
              <h3 className="mt-5 text-xl font-semibold">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {description}
              </p>
              {index < steps.length - 1 ? (
                <ArrowRight
                  aria-hidden="true"
                  className="absolute -right-4 top-1/2 z-10 hidden size-7 -translate-y-1/2 rounded-full border bg-background p-1 text-muted-foreground md:block"
                />
              ) : null}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
