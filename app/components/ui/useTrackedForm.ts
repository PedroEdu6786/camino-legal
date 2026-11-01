"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { sendEmail, type FormState } from "../../actions/sendEmail";
import { handoffMetaLead } from "../../actions/metaLead";
import { getConsentSnapshot, trackEvent } from "../../lib/analytics";

import type { FormId } from "../../lib/contactRequest";

type Context = Record<string, string | number | boolean | null>;

/** One lifecycle per mounted form; deliberate retries get new attempts, SMTP retries stay server-side. */
export function useTrackedForm(formId: FormId, context: Context = {}, prepare?: (data: FormData) => void) {
  const instanceRef = useRef("");
  const [instanceId, setInstanceId] = useState("");
  useEffect(() => {
    instanceRef.current ||= crypto.randomUUID();
    setInstanceId(instanceRef.current);
  }, []);
  const started = useRef(false);
  const busy = useRef(false);
  const submissionLocked = useRef(false);
  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    if (submissionLocked.current) { event.preventDefault(); return; }
    submissionLocked.current = true;
  };
  const ordinal = useRef(0);
  const invalidAttempt = useRef<string | null>(null);
  const base = { ...context, form_id: formId, form_instance_id: instanceId, source_surface: formId === "contact" ? "contact" : formId === "trademark_evaluation" ? "evaluation_modal" : "quotation" };
  const start = () => {
    if (started.current || getConsentSnapshot().status !== "granted") return;
    started.current = true;
    trackEvent("form_start", base);
  };
  const [state, action, pending] = useActionState<FormState, FormData>(async (previous, data) => {
    if (busy.current) return previous;
    busy.current = true;
    const attemptId = crypto.randomUUID();
    const attemptNumber = ++ordinal.current;
    const consent = getConsentSnapshot();
    const eventContext = { ...base, attempt_id: attemptId, attempt_number: attemptNumber };
    trackEvent("form_submit_attempt", eventContext);
    data.set("sourcePath", window.location.pathname);
    data.set("formId", formId);
    data.set("formKind", formId === "trademark_evaluation" ? "evaluation" : "contact");
    data.set("attemptId", attemptId);
    data.set("attemptNumber", String(attemptNumber));
    if (typeof context.service_id === "string") data.set("serviceId", context.service_id);
    if (consent.status === "granted" && consent.serverAcknowledged) data.set("consentVersion", consent.version);
    prepare?.(data);
    const stillConsented = () => { const current = getConsentSnapshot(); return consent.status === "granted" && current.status === "granted" && current.version === consent.version; };
    try {
      const result = await sendEmail(previous, data);
      if (result?.success && result.outcomeEventId) {
        const fresh = getConsentSnapshot();
        // Track only under the same still-granted consent revision; never replay old activity on re-grant.
        if (fresh.status === "granted" && consent.status === "granted" && fresh.version === consent.version) {
          trackEvent("lead_submitted", eventContext, { eventId: result.outcomeEventId });
          if (fresh.serverAcknowledged && result.conversionReceipt) {
            void handoffMetaLead(result.conversionReceipt, fresh.version).catch(() => {});
          }
        }
      } else if (stillConsented() && result?.outcome === "validation_failed") {
        trackEvent("form_validation_failed", { ...eventContext, field_id: "form", error_category: "other_validation" });
      } else if (stillConsented() && !result?.success) {
        trackEvent("form_submit_failed", { ...eventContext, failure_category: result?.outcome ?? "transport_failure" });
      }
      return result;
    } catch {
      if (stillConsented()) trackEvent("form_submit_failed", { ...eventContext, failure_category: "unknown" });
      return { success: false, message: "No pudimos confirmar el envío. Tus datos siguen aquí; inténtalo de nuevo." };
    } finally { busy.current = false; submissionLocked.current = false; }
  }, null);
  const invalid = (event: React.FormEvent<HTMLFormElement>) => {
    const field = event.target as HTMLInputElement;
    const allowed = ["name", "email", "phone", "message", "details"];
    if (!allowed.includes(field.name)) return;
    // Native validation may fire once per invalid field in the same attempted submission.
    if (!invalidAttempt.current) {
      invalidAttempt.current = crypto.randomUUID();
      ordinal.current += 1;
      trackEvent("form_submit_attempt", { ...base, attempt_id: invalidAttempt.current, attempt_number: ordinal.current });
      queueMicrotask(() => { invalidAttempt.current = null; });
    }
    trackEvent("form_validation_failed", { ...base, attempt_id: invalidAttempt.current, field_id: field.name,
      error_category: field.validity.valueMissing ? "required" : field.validity.typeMismatch || field.validity.patternMismatch ? "format" : field.validity.tooLong || field.validity.tooShort ? "length" : "other_validation" });
  };
  return { state, action, pending, instanceId, start, invalid, submit };
}
