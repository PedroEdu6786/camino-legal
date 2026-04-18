"use client";

import Image from "next/image";
import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { sendEmail, type FormState } from "../../actions/sendEmail";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-xl bg-button-bg px-5 py-3.5 text-sm font-bold text-button-text transition-all duration-200 ease-out hover:-translate-y-1 hover:shadow-lg active:translate-y-0 active:scale-95 active:shadow-none disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
    >
      {pending ? "Enviando\u2026" : "Enviar mensaje"}
    </button>
  );
}

const inputClass =
  "w-full rounded-xl border-2 border-foreground/10 bg-background px-4 py-3 text-sm placeholder:text-foreground/30 focus:outline-none focus:border-primary/40 transition-colors duration-200";

export default function Contact() {
  const [state, action] = useActionState<FormState, FormData>(sendEmail, null);
  const [phone, setPhone] = useState("");

  const handlePhone = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(e.target.value.replace(/\D/g, "").slice(0, 10));
  };

  return (
    <section
      id="contact"
      className="mx-auto max-w-7xl px-6 py-12 md:py-16 lg:py-24 lg:px-8"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
        {/* Left — fun copy */}
        <div className="flex flex-col gap-6">
          {/* Floating stickers */}
          <div className="relative flex items-start gap-4">
            <div className="relative">
              <Image
                src="/stickers/Recurso 88.png"
                alt=""
                width={100}
                height={100}
                aria-hidden
                className="w-20 lg:w-28 -rotate-12 drop-shadow-md pointer-events-none select-none"
              />
              <Image
                src="/stickers/Recurso 77.png"
                alt=""
                width={60}
                height={60}
                aria-hidden
                className="w-12 lg:w-16 rotate-12 absolute -bottom-4 -right-4 pointer-events-none select-none"
              />
            </div>
            <Image
              src="/stickers/Recurso 100.png"
              alt=""
              width={70}
              height={70}
              aria-hidden
              className="w-14 lg:w-20 rotate-6 self-end mb-2 pointer-events-none select-none"
            />
          </div>

          <div className="flex flex-col gap-3">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-black tracking-tight leading-tight">
              Hablemos de
              <br />
              <span className="text-secondary">tu caso</span>
            </h2>
            <p className="text-xs md:text-sm lg:text-base leading-relaxed opacity-60">
              Comp&aacute;rtenos tu caso y con gusto te orientamos sobre el
              proceso, tiempos y costos.
            </p>
          </div>

          <a
            href="mailto:info@caminolegal.com.mx"
            className="flex items-center gap-3 text-xs md:text-sm opacity-60 hover:opacity-100 transition-opacity w-fit group"
          >
            <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
              <svg
                className="w-4 h-4 text-primary"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0l-9.75 6.75L2.25 6.75"
                />
              </svg>
            </span>
            info@caminolegal.com.mx
          </a>
        </div>

        {/* Right — form */}
        <div className="relative">
          {/* Decorative sticker top-right */}
          {!state?.success && (
            <Image
              src="/stickers/Recurso 79.png"
              alt=""
              width={60}
              height={60}
              aria-hidden
              className="w-12 absolute -top-6 -right-2 rotate-12 opacity-80 pointer-events-none select-none z-10 hidden sm:block"
            />
          )}

          <div className="rounded-3xl border-2 border-foreground/8 bg-foreground/[0.02] p-6 md:p-8">
            {state?.success ? (
              <div className="flex flex-col items-center gap-5 text-center py-6">
                <Image
                  src="/stickers/Recurso 101.png"
                  alt=""
                  width={100}
                  height={100}
                  aria-hidden
                  className="w-20 animate-bounce pointer-events-none select-none"
                />
                <p className="text-base md:text-lg font-bold">
                  {state.message}
                </p>
                <p className="text-xs opacity-50">
                  Te responderemos lo antes posible.
                </p>
              </div>
            ) : (
              <form action={action} className="flex flex-col gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label
                      htmlFor="name"
                      className="text-xs font-semibold opacity-50 uppercase tracking-wide"
                    >
                      Nombre completo
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      placeholder="Tu nombre completo"
                      className={inputClass}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label
                      htmlFor="phone"
                      className="text-xs font-semibold opacity-50 uppercase tracking-wide"
                    >
                      Tel&eacute;fono
                    </label>
                    <div className="flex items-center rounded-xl border-2 border-foreground/10 bg-background focus-within:border-primary/40 transition-colors duration-200">
                      <span className="pl-4 pr-2 text-sm text-foreground/40 select-none shrink-0">
                        +52
                      </span>
                      <span className="text-foreground/15 text-sm shrink-0">
                        |
                      </span>
                      <input
                        id="phone"
                        name="phone"
                        type="tel"
                        inputMode="numeric"
                        required
                        minLength={10}
                        maxLength={10}
                        placeholder="5512345678"
                        value={phone}
                        onChange={handlePhone}
                        className="flex-1 bg-transparent px-3 py-3 text-sm placeholder:text-foreground/30 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="email"
                    className="text-xs font-semibold opacity-50 uppercase tracking-wide"
                  >
                    Correo electr&oacute;nico
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    placeholder="tu@correo.com"
                    className={inputClass}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="message"
                    className="text-xs font-semibold opacity-50 uppercase tracking-wide"
                  >
                    &iquest;En qu&eacute; podemos ayudarte?
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={4}
                    placeholder="Cu&eacute;ntanos en qu&eacute; podemos ayudarte\u2026"
                    className={`${inputClass} resize-none`}
                  />
                </div>
                {state?.success === false && (
                  <p className="text-xs text-secondary">{state.message}</p>
                )}
                <SubmitButton />
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
