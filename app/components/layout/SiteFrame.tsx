import Navbar from "./Navbar";
import Footer from "./Footer";
import BackgroundCurves from "../ui/BackgroundCurves";
import "../../site-pages.css";

export default function SiteFrame({ children }: { children: React.ReactNode }) {
  return <div className="relative"><BackgroundCurves /><a className="skip-link" href="#contenido">Ir al contenido</a><Navbar /><main id="contenido" className="site-main">{children}</main><Footer /></div>;
}
