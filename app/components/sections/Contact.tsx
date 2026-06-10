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

          {/* WhatsApp card */}
          <a
            href="https://api.whatsapp.com/send/?phone=529992505160&text&type=phone_number&app_absent=0"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 rounded-2xl border border-foreground/8 bg-foreground/[0.02] p-5 hover:border-foreground/20 hover:bg-foreground/[0.04] transition-all duration-200 group"
          >
            <span className="w-10 h-10 rounded-full bg-[#25D366]/10 flex items-center justify-center shrink-0 group-hover:bg-[#25D366]/20 transition-colors">
              <svg className="w-5 h-5 text-[#25D366]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
            </span>
            <div>
              <p className="text-sm font-semibold">Escr&iacute;benos por WhatsApp</p>
              <p className="text-xs opacity-50 mt-0.5">Respuesta r&aacute;pida, sin formularios.</p>
            </div>
          </a>

          {/* Email card */}
          <a
            href="mailto:info@caminolegal.com.mx"
            className="flex items-center gap-4 rounded-2xl border border-foreground/8 bg-foreground/[0.02] p-5 hover:border-foreground/20 hover:bg-foreground/[0.04] transition-all duration-200 group"
          >
            <span className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
              <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0l-9.75 6.75L2.25 6.75" />
              </svg>
            </span>
            <div>
              <p className="text-sm font-semibold">info@caminolegal.com.mx</p>
              <p className="text-xs opacity-50 mt-0.5">Tambi&eacute;n puedes escribirnos por correo.</p>
            </div>
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
