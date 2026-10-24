"use client";

import { useEffect, useRef, useState } from "react";
import { useTrackedForm } from "./useTrackedForm";
import { trackEvent } from "../../lib/analytics";
import { evaluationMessage, type FormId } from "../../lib/contactRequest";
import PhoneField from "./PhoneField";
import styles from "./EvaluationModal.module.css";

export default function ConsultationModal({ onClose, quoteContext = {}, kind = "evaluation", initialMessage = evaluationMessage }: {
  onClose: () => void;
  quoteContext?: Record<string, string | number | boolean | null>;
  kind?: "evaluation" | "quotation";
  initialMessage?: string;
}) {
  const evaluation = kind === "evaluation";
  const formId: FormId = evaluation ? "trademark_evaluation" : "quotation_consultation";
  const prefix = evaluation ? "evaluation" : "consultation";
  const dialogRef = useRef<HTMLDialogElement>(null);
  const close = (reason = "dismiss") => {
    if (evaluation) trackEvent("evaluation_close", { ...quoteContext, form_id: "trademark_evaluation", source_surface: "evaluation_modal", close_reason: reason });
    dialogRef.current?.close();
    onClose();
  };
  const [fields, setFields] = useState({ name: "", email: "", message: initialMessage });
  const field = (key: keyof typeof fields) => ({
    value: fields[key],
    onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setFields(previous => ({ ...previous, [key]: event.target.value })),
  });
  const { state, action, pending, instanceId, start, invalid, submit } = useTrackedForm(formId, quoteContext);

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
      aria-labelledby={`${prefix}-title`}
      aria-describedby={`${prefix}-description`}
      onClose={onClose}
      onCancel={event => { event.preventDefault(); if (!pending) close("escape"); }}
      onClick={event => { if (event.target === event.currentTarget && !pending) close("backdrop"); }}
    >
      <div className={styles.content}>
        <button type="button" className={styles.close} onClick={() => close()} disabled={pending} aria-label={evaluation ? "Cerrar evaluación" : "Cerrar consulta"}>×</button>
        <p className={styles.note}>{evaluation ? "Hablemos de tu marca." : "Hablemos de tu proyecto."}</p>
        <h2 id={`${prefix}-title`}>{evaluation ? "Empecemos con la evaluación" : "Consulta tu cotización"}</h2>
        <p id={`${prefix}-description`}>{evaluation ? <>Te contamos cómo empezar con la evaluación de <strong>$799 MXN, IVA incluido.</strong></> : "Déjanos tus datos y te responderemos por correo sobre el servicio que elegiste."}</p>
        {state?.success ? (
          <div className={styles.success} role="status">
            <h3>¡Recibimos tu solicitud!</h3>
            <p>Nos pondremos en contacto contigo para confirmar los detalles y los siguientes pasos.</p>
            <button type="button" className="site-button" onClick={() => close("success_done")}>Listo</button>
          </div>
        ) : (
          <>
          {evaluation && <><a
            className={`site-button ${styles.whatsapp}`}
            href={`https://wa.me/529992505160?text=${encodeURIComponent("Hola, Camino Legal. Me interesa la evaluación de mi marca de $799 MXN. ¿Me cuentan cómo empezar?")}`}
            target="_blank"
            rel="noopener noreferrer"
            data-analytics-event="whatsapp_click" data-analytics-action="evaluation.whatsapp" data-analytics-source="evaluation_modal" data-analytics-service="registro-de-marca"
          >Hablar por WhatsApp ↗</a>
          <p className={styles.divider}>O déjanos tus datos y te contactamos.</p></>}
          <form data-analytics-form={instanceId ? formId : undefined} data-analytics-instance={instanceId || undefined} onChange={start} onInvalidCapture={invalid} onSubmitCapture={submit} action={action} aria-busy={pending} className={styles.form}>
            <fieldset disabled={pending}>
              <label htmlFor={`${prefix}-name`}>Tu nombre</label>
              <input id={`${prefix}-name`} name="name" {...field("name")} autoComplete="name" required maxLength={150} placeholder="¿Cómo te llamas?" />
              <label htmlFor={`${prefix}-email`}>Correo electrónico</label>
              <input id={`${prefix}-email`} name="email" {...field("email")} type="email" autoComplete="email" required maxLength={254} placeholder="tu@correo.com" />
              <label htmlFor={`${prefix}-phone`}>Teléfono</label>
              <PhoneField id={`${prefix}-phone`} />
              <label htmlFor={`${prefix}-message`}>¿En qué podemos ayudarte?</label>
              <textarea id={`${prefix}-message`} name="message" {...field("message")} required maxLength={5000} rows={6} aria-describedby={`${prefix}-message-hint`} />
              <p id={`${prefix}-message-hint`} className={styles.hint}>Preparamos este mensaje con tu solicitud. Puedes editarlo y agregar detalles de tu proyecto.</p>
            </fieldset>
            <p className={styles.hint}>Enviar la solicitud no genera ningún cobro. Confirmaremos contigo antes de iniciar.</p>
            {state?.success === false && <p className={styles.error} role="alert">{state.message}</p>}
            <button type="submit" className={styles.submit} disabled={pending}>{pending ? "Enviando…" : evaluation ? "Solicitar evaluación →" : "Enviar consulta →"}</button>
          </form>
          </>
        )}
      </div>
    </dialog>
  );
}
