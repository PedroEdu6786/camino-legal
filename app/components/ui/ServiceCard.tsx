"use client";

import { useEffect, useRef, useState } from "react";

interface ServiceCardProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export default function ServiceCard({ title, description, icon, className = "", style }: ServiceCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={style}
      className={`rounded-xl p-6 md:p-8 lg:p-10 lg:py-14 flex flex-col gap-3 lg:gap-4 shadow-lg transition-opacity duration-700 ease-out will-change-transform ${
        visible ? "opacity-100" : "opacity-0 translate-y-8"
      } ${className}`}
    >
      {icon && <div className="mb-1 opacity-80">{icon}</div>}
      <h3 className="text-lg md:text-xl lg:text-2xl font-semibold">{title}</h3>
      <p className="text-sm md:text-base lg:text-lg leading-relaxed opacity-80">{description}</p>
    </div>
  );
}
