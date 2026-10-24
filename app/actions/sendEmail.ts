"use server";
import { contactRequest, validContactRequest } from "../lib/contactRequest";
import nodemailer from "nodemailer";
import { cookies, headers } from "next/headers";
import { deliverEmail, type EmailOutcome } from "../lib/server/emailDelivery";
import { CONSENT_COOKIE, createReceipt, matchingHashes, readConsent, safeUserAgent, websiteSourceUrl } from "../lib/server/analyticsSecurity";

export type FormState = {
  success: boolean;
  message: string;
  outcome?: EmailOutcome | "validation_failed";
  submissionId?: string;
  outcomeEventId?: string;
  conversionReceipt?: string;
  attemptId?: string;
  failureCategory?: string;
} | null;
const value = (data: FormData, field: string) => typeof data.get(field) === "string" ? String(data.get(field)).trim() : "";
function escapeHtml(input: string) {
  const entities: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
  return input.replace(/[&<>"']/g, character => entities[character]);
}
export async function sendEmail(_prevState: FormState, formData: FormData): Promise<FormState> {
  const request = contactRequest(formData);
  const { name, phone, email, message, formId } = request;
  const submittedAttempt = value(formData, "attemptId");
  const attemptId = /^[a-zA-Z0-9_-]{1,100}$/.test(submittedAttempt) ? submittedAttempt : undefined;
  if (!validContactRequest(request)) {
    return { success: false, outcome: "validation_failed", failureCategory: "invalid_fields", attemptId, message: "Por favor, revisa los campos e incluye un teléfono válido para el país seleccionado, un correo válido y tu mensaje." };
  }
  // Request-time evidence is used only for collection eligibility, never to dispatch CAPI after SMTP.
  let consent = null;
  try { consent = readConsent((await cookies()).get(CONSENT_COOKIE)?.value); } catch { /* Email does not depend on cookies. */ }
  const consentVersion = value(formData, "consentVersion");
  const eligible = consent?.status === "granted" && consent.version === consentVersion;
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST, port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === "true",
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    connectionTimeout: 10000, greetingTimeout: 10000, socketTimeout: 10000,
  });
  const recipient = "info@caminolegal.com.mx";
  const result = await deliverEmail({
    formId, consentStatus: eligible ? "granted" : consent?.status === "denied" ? "denied" : "unknown", recipient,
    send: () => transporter.sendMail({
      from: `"Camino Legal Web" <${process.env.SMTP_USER}>`, to: recipient, replyTo: email,
      subject: `Nuevo contacto: ${name.replace(/[\r\n]/g, " ")}`,
      html: `<h2>Nuevo mensaje desde el sitio web</h2><p><strong>Nombre:</strong> ${escapeHtml(name)}</p>${phone ? `<p><strong>Tel&eacute;fono:</strong> ${escapeHtml(phone)}</p>` : ""}<p><strong>Correo:</strong> ${escapeHtml(email)}</p><hr /><p><strong>Mensaje:</strong></p><p>${escapeHtml(message).replace(/\n/g, "<br/>")}</p>`,
    }),
  });
  transporter.close();
  if (result.outcome !== "accepted") {
    return { success: false, outcome: result.outcome, submissionId: result.submissionId, attemptId, failureCategory: result.outcome,
      message: result.outcome === "unknown" ? "No pudimos confirmar el envío después de dos intentos. Puedes contactarnos directamente para verificarlo." : "Ocurrió un error al enviar tu mensaje. Por favor inténtalo de nuevo o contáctanos directamente." };
  }
  const now = Date.now();
  let clientUserAgent: string | undefined;
  if (eligible) {
    try { clientUserAgent = safeUserAgent((await headers()).get("user-agent")); } catch { /* Missing request evidence disables handoff. */ }
  }
  const eventSourceUrl = websiteSourceUrl(formId, value(formData, "sourcePath"));
  const conversionReceipt = eligible && result.outcomeEventId ? createReceipt({
    outcomeEventId: result.outcomeEventId, occurredAt: now, expiresAt: now + 300000,
    consentVersion, formId, ...matchingHashes(email, phone),
    ...(eventSourceUrl ? { eventSourceUrl } : {}), ...(clientUserAgent ? { clientUserAgent } : {}),
  }) : null;
  return { success: true, outcome: "accepted", submissionId: result.submissionId, outcomeEventId: result.outcomeEventId, attemptId,
    ...(conversionReceipt ? { conversionReceipt } : {}), message: "¡Mensaje enviado! Pronto nos ponemos en contacto contigo." };
}
