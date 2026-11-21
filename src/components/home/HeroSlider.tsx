"use client";

import Link from "next/link";
import { Autoplay, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";

const slides = [
  {
    eyebrow: "A world between the covers",
    title: "Your next favorite book is waiting.",
    description:
      "Find a story to love, then share one of your own with the BookNook community.",
    background: "from-stone-950 via-amber-950 to-orange-900",
    accent: "bg-amber-300/15",
  },
  {
    eyebrow: "Read more, spend less",
    title: "Good books are better shared.",
    description:
      "Borrow a new perspective from a reader nearby and pass a great read along.",
    background: "from-slate-950 via-indigo-950 to-blue-900",
    accent: "bg-sky-300/15",
  },
  {
    eyebrow: "Make room for one more story",
    title: "Turn your shelf into a community.",
    description:
      "List books you have finished and help another reader find their next page-turner.",
    background: "from-emerald-950 via-teal-950 to-cyan-900",
    accent: "bg-teal-200/15",
  },
];

export default function HeroSlider() {
  return (
    <section
      aria-label="BookNook highlights"
      className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8"
    >
      <Swiper
        modules={[Autoplay, Pagination]}
        autoplay={{ delay: 5500, disableOnInteraction: false }}
        pagination={{ clickable: true }}
        loop
        className="hero-swiper overflow-hidden rounded-3xl"
      >
        {slides.map((slide, index) => {
          const Heading = index === 0 ? "h1" : "h2";

          return (
            <SwiperSlide key={slide.title}>
              <div
                className={`relative isolate flex min-h-[430px] items-center overflow-hidden bg-gradient-to-br ${slide.background} px-7 py-14 text-white sm:px-14 lg:min-h-[500px] lg:px-20`}
              >
                <div
                  aria-hidden="true"
                  className={`absolute -right-20 -top-24 -z-10 size-96 rounded-full blur-3xl ${slide.accent}`}
                />
                <div
                  aria-hidden="true"
                  className="absolute -bottom-36 right-[12%] -z-10 h-80 w-56 rotate-12 rounded-2xl border border-white/15 bg-white/5 shadow-2xl"
                />
                <div
                  aria-hidden="true"
                  className="absolute -bottom-28 right-[24%] -z-10 h-72 w-48 -rotate-6 rounded-2xl border border-white/10 bg-white/5"
                />
                <div className="max-w-2xl pb-8">
                  <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-white/70">
                    {slide.eyebrow}
                  </p>
                  <Heading className="max-w-xl text-4xl font-semibold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
                    {slide.title}
                  </Heading>
                  <p className="mt-5 max-w-lg text-base leading-7 text-white/75 sm:text-lg">
                    {slide.description}
                  </p>
                  <Link
                    href="/books"
                    className="site-button site-button-light mt-8"
                  >
                    Browse Books
                    <span aria-hidden="true" className="ml-2">
                      →
                    </span>
                  </Link>
                </div>
              </div>
            </SwiperSlide>
          );
        })}
      </Swiper>
    </section>
  );
}
