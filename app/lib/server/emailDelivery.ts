// Content-free operational telemetry. This module has no provider or browser dependency.
import { randomUUID } from "node:crypto";
export type EmailOutcome = "accepted" | "recipient_rejected" | "transport_failure" | "unknown";
import type { FormId } from "../contactRequest.ts";
export type { FormId } from "../contactRequest.ts";
export type EmailRecord = {
  schema_version: 1;
  event_name: "email_attempted" | "email_result";
  event_id: string;
  occurred_at: string;
  submission_id: string;
  attempt_id: string;
  attempt_number: 1 | 2;
  form_id: FormId;
  consent_status: "granted" | "denied" | "unknown";
  stage: "transport";
  outcome?: EmailOutcome;
  duration_ms?: number;
  error_category?: "recipient_rejected" | "connection" | "authentication" | "configuration" | "uncertain";
};
export type TransportInfo = { accepted?: readonly unknown[]; rejected?: readonly unknown[]; pending?: readonly unknown[] };
const address = (value: unknown) => {
  const candidate = typeof value === "string" ? value : value && typeof value === "object" && "address" in value ? value.address : "";
  return typeof candidate === "string" ? candidate.trim().toLowerCase() : "";
};
export function classifyTransport(info: TransportInfo, recipient: string): EmailOutcome {
  if (info.accepted?.some(value => address(value) === address(recipient))) return "accepted";
  if (info.rejected?.some(value => address(value) === address(recipient))) return "recipient_rejected";
  return "unknown";
}
export function classifyTransportError(error: unknown): { outcome: EmailOutcome; category: NonNullable<EmailRecord["error_category"]> } {
  const safe = error && typeof error === "object" ? error as { code?: unknown; command?: unknown; responseCode?: unknown } : {};
  if (safe.code === "EAUTH") return { outcome: "transport_failure", category: "authentication" };
  if (safe.code === "EENVELOPE" || (safe.command === "RCPT TO" && typeof safe.responseCode === "number" && safe.responseCode >= 400)) return { outcome: "recipient_rejected", category: "recipient_rejected" };
  // Nodemailer labels post-DATA socket timeouts as command CONN as well.
  // Generic connection/socket errors therefore cannot prove non-acceptance.
  if (["ETIMEDOUT", "ESOCKET", "ECONNECTION"].includes(String(safe.code))) return { outcome: "unknown", category: "uncertain" };
  if (["EDNS", "ECONNREFUSED"].includes(String(safe.code)) || ["EHLO", "HELO", "STARTTLS", "AUTH"].includes(String(safe.command))) return { outcome: "transport_failure", category: "connection" };
  if (["EMESSAGE", "ESTREAM"].includes(String(safe.code))) return { outcome: "transport_failure", category: "configuration" };
  // DATA/socket timeouts and unclassified failures may occur after acceptance.
  return { outcome: "unknown", category: "uncertain" };
}
export async function deliverEmail({ send, recipient, formId, consentStatus, sink = record => console.info(JSON.stringify(record)), now = Date.now, id = randomUUID }: {
  send: () => Promise<TransportInfo>;
  recipient: string;
  formId: FormId;
  consentStatus: EmailRecord["consent_status"];
  sink?: (record: EmailRecord) => void;
  now?: () => number;
  id?: () => string;
}): Promise<{ outcome: EmailOutcome; submissionId: string; outcomeEventId?: string; attempts: number }> {
  const submissionId = id();
  const emit = (record: EmailRecord) => { try { sink(record); } catch { /* Logging must never cause an SMTP retry. */ } };
  for (const attemptNumber of [1, 2] as const) {
    const started = now();
    const base = { schema_version: 1 as const, submission_id: submissionId, attempt_id: id(), attempt_number: attemptNumber, form_id: formId, consent_status: consentStatus, stage: "transport" as const };
    emit({ ...base, event_name: "email_attempted", event_id: id(), occurred_at: new Date(started).toISOString() });
    let outcome: EmailOutcome;
    let category: EmailRecord["error_category"];
    try {
      outcome = classifyTransport(await send(), recipient);
      if (outcome === "recipient_rejected") category = "recipient_rejected";
      if (outcome === "unknown") category = "uncertain";
    } catch (error) {
      const classified = classifyTransportError(error);
      outcome = classified.outcome;
      category = classified.category;
    }
    const ended = now();
    emit({ ...base, event_name: "email_result", event_id: id(), occurred_at: new Date(ended).toISOString(), outcome, duration_ms: Math.max(0, Math.round(ended - started)), ...(category ? { error_category: category } : {}) });
    // A failed retry cannot disprove acceptance of the first timed-out message.
    // Per-transport records remain factual; unresolved logical submissions require review.
    if (outcome !== "unknown" || attemptNumber === 2) {
      const logicalOutcome = attemptNumber === 2 && outcome !== "accepted" ? "unknown" : outcome;
      return { outcome: logicalOutcome, submissionId, attempts: attemptNumber, ...(outcome === "accepted" ? { outcomeEventId: id() } : {}) };
    }
  }
  throw new Error("Unreachable delivery state");
}
