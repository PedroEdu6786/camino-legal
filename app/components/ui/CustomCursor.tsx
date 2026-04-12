"use client";

import { useEffect, useRef } from "react";

export default function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const pos = useRef({ x: 0, y: 0 });
  const visible = useRef(false);
  const pressed = useRef(false);

  useEffect(() => {
    const cursor = cursorRef.current;
    if (!cursor) return;

    const onMouseMove = (e: MouseEvent) => {
      pos.current = { x: e.clientX, y: e.clientY };
      if (!visible.current) {
        visible.current = true;
        cursor.style.opacity = "1";
      }
    };

    const onMouseLeave = () => {
      visible.current = false;
      cursor.style.opacity = "0";
    };

    const onMouseDown = () => {
      pressed.current = true;
      cursor.style.opacity = "0.3";
    };

    const onMouseUp = () => {
      pressed.current = false;
      if (visible.current) {
        cursor.style.opacity = "1";
      }
    };

    let raf: number;
    let cx = 0;
    let cy = 0;

    const animate = () => {
      cx += (pos.current.x - cx) * 0.15;
      cy += (pos.current.y - cy) * 0.15;
      const scale = pressed.current ? 0.8 : 1;
      cursor.style.transform = `translate(${cx - 16}px, ${cy - 16}px) scale(${scale})`;
      raf = requestAnimationFrame(animate);
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseleave", onMouseLeave);
    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("mouseup", onMouseUp);
    raf = requestAnimationFrame(animate);

    return () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseleave", onMouseLeave);
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("mouseup", onMouseUp);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      ref={cursorRef}
      className="pointer-events-none fixed top-0 left-0 z-[9999] h-8 w-8 rounded-full border-2 border-secondary bg-primary/70 opacity-0 transition-opacity duration-200 hidden md:block"
    />
  );
}
