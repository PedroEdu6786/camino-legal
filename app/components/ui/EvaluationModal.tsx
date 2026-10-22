"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { sendEmail, type FormState } from "../../actions/sendEmail";
import { trackEvent, trackMeta } from "../../lib/analytics";
import styles from "./EvaluationModal.module.css";

export default function EvaluationModal({ onClose }: { onClose: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const close = () => {
    dialogRef.current?.close();
    onClose();
  };
  const [fields, setFields] = useState({ name: "", email: "", details: "" });
  const field = (key: keyof typeof fields) => ({
    value: fields[key],
    onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setFields(previous => ({ ...previous, [key]: event.target.value })),
  });
  const [state, action, pending] = useActionState<FormState, FormData>(async (previous, data) => {
    data.set("message", [
      "Solicitud desde Cotizaciones: evaluación de viabilidad de marca.",
      "Quiero comenzar únicamente con la evaluación de $799 MXN, IVA incluido.",
      `Mensaje: ${data.get("details") || "Me gustaría que me contacten para conocer los siguientes pasos."}`,
    ].join("\n\n"));
    try {
      return await sendEmail(previous, data);
    } catch {
      return { success: false, message: "No pudimos enviar tu solicitud. Tus datos siguen aquí; inténtalo de nuevo." };
    }
  }, null);

  useEffect(() => {
    const dialog = dialogRef.current;
    const overflow = document.body.style.overflow;
    dialog?.showModal();
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = overflow;
    };
  }, []);

  return (
    <dialog
      ref={dialogRef}
      className={styles.modal}
      aria-labelledby="evaluation-title"
      aria-describedby="evaluation-description"
      onClose={onClose}
      onCancel={event => { event.preventDefault(); if (!pending) close(); }}
      onClick={event => { if (event.target === event.currentTarget && !pending) close(); }}
    >
      <div className={styles.content}>
        <button type="button" className={styles.close} onClick={close} disabled={pending} aria-label="Cerrar evaluación">×</button>
        <p className={styles.note}>Hablemos de tu marca.</p>
        <h2 id="evaluation-title">¿Cómo prefieres contactarnos?</h2>
        <p id="evaluation-description">Te contamos cómo empezar con la evaluación de <strong>$799 MXN, IVA incluido.</strong></p>
        {state?.success ? (
          <div className={styles.success} role="status">
            <h3>¡Recibimos tu solicitud!</h3>
            <p>Nos pondremos en contacto contigo para confirmar los detalles y los siguientes pasos.</p>
            <button type="button" className="site-button" onClick={close}>Listo</button>
          </div>
        ) : (
          <>
          <a
            className={`site-button ${styles.whatsapp}`}
            href={`https://wa.me/529992505160?text=${encodeURIComponent("Hola, Camino Legal. Me interesa la evaluación de mi marca de $799 MXN. ¿Me cuentan cómo empezar?")}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => { trackEvent("whatsapp_click", { source: "evaluation_modal" }); trackMeta("Contact"); }}
          >Hablar por WhatsApp ↗</a>
          <p className={styles.divider}>O déjanos tu correo y te contactamos.</p>
          <form action={action} aria-busy={pending} className={styles.form}>
            <fieldset disabled={pending}>
              <label htmlFor="evaluation-name">Tu nombre</label>
              <input id="evaluation-name" name="name" {...field("name")} autoComplete="name" required maxLength={150} placeholder="¿Cómo te llamas?" />
              <label htmlFor="evaluation-email">Correo electrónico</label>
              <input id="evaluation-email" name="email" {...field("email")} type="email" autoComplete="email" required maxLength={254} placeholder="tu@correo.com" />
              <label htmlFor="evaluation-details">Mensaje <span>(opcional)</span></label>
              <textarea id="evaluation-details" name="details" {...field("details")} maxLength={1500} rows={2} placeholder="Si tienes alguna duda, cuéntanos." />
            </fieldset>
            <p className={styles.hint}>Enviar la solicitud no genera ningún cobro. Confirmaremos contigo antes de iniciar.</p>
            {state?.success === false && <p className={styles.error} role="alert">{state.message}</p>}
            <button type="submit" className={styles.submit} disabled={pending}>{pending ? "Enviando…" : "Quiero que me contacten →"}</button>
          </form>
          </>
        )}
      </div>
    </dialog>
  );
}
