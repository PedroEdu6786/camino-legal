import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import Hero from "./components/sections/Hero";
import Services from "./components/sections/Services";
import Process from "./components/sections/Process";
import About from "./components/sections/About";
import Banner from "./components/sections/Banner";
import Reviews from "./components/sections/Reviews";
import FAQ from "./components/sections/FAQ";
import Contact from "./components/sections/Contact";
import BackgroundCurves from "./components/ui/BackgroundCurves";

export default function Home() {
  return (
    <div className="relative">
      <BackgroundCurves />
      <Navbar />
      <main className="flex-1">
        <Hero />
        <Services />
        <Process />
        <About />
        <Banner />
        <Reviews />
        <FAQ />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
