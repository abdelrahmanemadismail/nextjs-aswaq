import { ListingCardProps } from "@/components/ListingCard";
import HeroSection from "./_components/Hero";
import ListingsSection from "./_components/ListingsSection";
import AdsBanner from "@/components/AdsBanner";
import Header from "@/components/Header";
import CategoryBar from "@/components/CategoryBar";

export default function Home() {
  const vehicles: ListingCardProps[] = [
    {
      photos: ["/400.svg", "/400.svg", "/400.svg"],
      slug: "v-1",
      title: "Vehicle 1",
      price: 1000,
      location: "New York",
      timestamp: "2024-01-01",
    },
    {
      photos: ["/400.svg", "/400.svg", "/400.svg"],
      slug: "v-2",
      title: "Vehicle 2",
      price: 2000,
      location: "Los Angeles",
      timestamp: "2024-01-02",
    },
    {
      photos: ["/400.svg", "/400.svg", "/400.svg"],
      slug: "v-3",
      title: "Vehicle 3",
      price: 3000,
      location: "Chicago",
      timestamp: "2024-01-03",
    },
    {
      photos: ["/400.svg", "/400.svg", "/400.svg"],
      slug: "v-4",
      title: "Vehicle 4",
      price: 4000,
      location: "Chicago",
      timestamp: "2024-01-03",
    },
  ];
  return (
    <div className="relative flex min-h-screen flex-col">
      <div className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <Header />
        <CategoryBar />
      </div>
      <main className="flex-grow w-full min-h-screen flex flex-col justify-center items-center">
        <HeroSection />
        <div className="container mt-20">
          <AdsBanner
            photos={["/400.svg", "/400.svg", "/400.svg"]}
            aspectRatio="video"
          />
          <ListingsSection title={"Vehicles"} listings={vehicles} />
          <ListingsSection title={"Vehicles"} listings={vehicles} />
          <ListingsSection title={"Vehicles"} listings={vehicles} />
        </div>
      </main>
    </div>
  );
}
