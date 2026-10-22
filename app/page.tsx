import Footer from "./components/layout/Footer";
import Hero from "./components/sections/Hero";
import ServicesPreview from "./components/sections/ServicesPreview";
import Process from "./components/sections/Process";
import About from "./components/sections/About";
import Banner from "./components/sections/Banner";
import Reviews from "./components/sections/Reviews";
import BackgroundCurves from "./components/ui/BackgroundCurves";
import MobileStickyBar from "./components/ui/MobileStickyBar";
import SectionViewTracker from "./components/ui/SectionViewTracker";

export default function Home() {
  return (
    <div className="relative">
      <BackgroundCurves />
      <main className="flex-1">
        <Hero />
        <ServicesPreview />
        <Process />
        <About />
        <Reviews />
        <Banner />
      </main>
      <Footer />
      <MobileStickyBar />
      <SectionViewTracker />
    </div>
  );
}
