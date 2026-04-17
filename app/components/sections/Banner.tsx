import Image from "next/image";

export default function Banner() {
  return (
    <section className="w-full bg-[#97B1C8] overflow-hidden mt-24 md:mt-36 lg:mt-52">
      <div className="mx-auto max-w-7xl px-6 lg:px-8 flex flex-col lg:flex-row items-end justify-between">
        {/* Text */}
        <div className="flex flex-col justify-center py-16 lg:py-28 flex-1 self-center">
          <h2 className="text-3xl md:text-4xl lg:text-6xl font-black tracking-tight [font-family:var(--font-poppins)] leading-[1.05] text-foreground max-w-2xl">
            El <span className="text-white">camino</span> se hace al decidir{" "}
            <span className="text-white">avanzar</span>
          </h2>
        </div>

        {/* Image */}
        <div className="hidden lg:flex flex-shrink-0 lg:w-[38%] justify-end items-end self-end">
          <Image
            src="/7-removebg.png"
            alt="Camino Legal"
            width={420}
            height={560}
            className="h-64 md:h-80 lg:h-[500px] w-auto object-contain"
          />
        </div>
      </div>
    </section>
  );
}
