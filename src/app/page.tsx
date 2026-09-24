import Header from "@/components/Header";
import Hero from "@/components/Hero";
import FeaturedTutors from "@/components/FeaturedTutors";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <Header />
      <Hero />
      <FeaturedTutors />
      <Footer />
    </main>
  );
}
