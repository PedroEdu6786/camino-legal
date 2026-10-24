"use client";

import { useEffect, useRef, useState } from "react";
import { useTrackedForm } from "./useTrackedForm";
import { trackEvent } from "../../lib/analytics";
import styles from "./EvaluationModal.module.css";

export default function EvaluationModal({ onClose, quoteContext = {} }: { onClose: () => void; quoteContext?: Record<string, string | number | boolean | null> }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const close = (reason = "dismiss") => {
    trackEvent("evaluation_close", { ...quoteContext, form_id: "trademark_evaluation", source_surface: "evaluation_modal", close_reason: reason });
    dialogRef.current?.close();
    onClose();
  };
  const [fields, setFields] = useState({ name: "", email: "", details: "" });
  const field = (key: keyof typeof fields) => ({
    value: fields[key],
    onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setFields(previous => ({ ...previous, [key]: event.target.value })),
  });
  const { state, action, pending, instanceId, start, invalid, submit } = useTrackedForm("trademark_evaluation", quoteContext, data => {
    data.set("message", ["Solicitud desde Cotizaciones: evaluación de viabilidad de marca.", "Quiero comenzar únicamente con la evaluación de $799 MXN, IVA incluido.", `Mensaje: ${data.get("details") || "Me gustaría que me contacten para conocer los siguientes pasos."}`].join("\n\n"));
  });

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
      onCancel={event => { event.preventDefault(); if (!pending) close("escape"); }}
      onClick={event => { if (event.target === event.currentTarget && !pending) close("backdrop"); }}
    >
      <div className={styles.content}>
        <button type="button" className={styles.close} onClick={() => close()} disabled={pending} aria-label="Cerrar evaluación">×</button>
        <p className={styles.note}>Hablemos de tu marca.</p>
        <h2 id="evaluation-title">¿Cómo prefieres contactarnos?</h2>
        <p id="evaluation-description">Te contamos cómo empezar con la evaluación de <strong>$799 MXN, IVA incluido.</strong></p>
        {state?.success ? (
          <div className={styles.success} role="status">
            <h3>¡Recibimos tu solicitud!</h3>
            <p>Nos pondremos en contacto contigo para confirmar los detalles y los siguientes pasos.</p>
            <button type="button" className="site-button" onClick={() => close("success_done")}>Listo</button>
          </div>
        ) : (
          <>
          <a
            className={`site-button ${styles.whatsapp}`}
            href={`https://wa.me/529992505160?text=${encodeURIComponent("Hola, Camino Legal. Me interesa la evaluación de mi marca de $799 MXN. ¿Me cuentan cómo empezar?")}`}
            target="_blank"
            rel="noopener noreferrer"
            data-analytics-event="whatsapp_click" data-analytics-action="evaluation.whatsapp" data-analytics-source="evaluation_modal" data-analytics-service="registro-de-marca"
          >Hablar por WhatsApp ↗</a>
          <p className={styles.divider}>O déjanos tu correo y te contactamos.</p>
          <form data-analytics-form={instanceId ? "trademark_evaluation" : undefined} data-analytics-instance={instanceId || undefined} onChange={start} onInvalidCapture={invalid} onSubmitCapture={submit} action={action} aria-busy={pending} className={styles.form}>
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
