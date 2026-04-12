import Navbar from "./components/navigation/Navbar";
import Hero from "./components/Hero";
import Services from "./components/Services";
import About from "./components/About";
import Footer from "./components/Footer";
import BackgroundCurves from "./components/ui/BackgroundCurves";

export default function Home() {
  return (
    <div className="relative">
      <BackgroundCurves />
      <Navbar />
      <main className="flex-1">
        <Hero />
        <Services />
        <About />
      </main>
      <Footer />
    </div>
  );
}
