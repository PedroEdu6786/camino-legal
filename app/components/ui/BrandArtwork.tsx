import Image from "next/image";

export default function BrandArtwork() {
  return (
    <div data-reveal className="camino-brand-art relative overflow-hidden rounded-2xl bg-primary flex flex-col items-center justify-center gap-9 px-8 py-14 min-h-[320px] md:min-h-[460px]">
      <svg aria-hidden="true" className="absolute inset-0 w-full h-full text-white/10" viewBox="0 0 500 500" fill="none" preserveAspectRatio="xMidYMid slice"><path d="M-80 420C80 210 390 530 440 300S140 120 240-70" stroke="currentColor" strokeWidth="3" strokeDasharray="10 14" /></svg>
      <Image src="/camino-legal-complete-white.png" alt="Camino Legal" width={240} height={200} className="relative w-40 md:w-48 h-auto object-contain" />
      <p className="camino-brand-note relative text-center text-[#F2ECEA] text-3xl md:text-4xl leading-tight [font-family:var(--font-bellaboo)] -rotate-3">Lo que creas importa.</p>
    </div>
  );
}
