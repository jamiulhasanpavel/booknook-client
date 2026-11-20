import { connection } from "next/server";
import HeroSlider from "@/components/home/HeroSlider";
import HowItWorks from "@/components/home/HowItWorks";
import NewArrivals from "@/components/home/NewArrivals";
import TopCategories from "@/components/home/TopCategories";

export default async function HomePage() {
  await connection();

  return (
    <main>
      <HeroSlider />
      <NewArrivals />
      <HowItWorks />
      <TopCategories />
    </main>
  );
}
