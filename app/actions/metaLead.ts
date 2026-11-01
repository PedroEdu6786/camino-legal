"use server";
import { cookies } from "next/headers";
import { CONSENT_COOKIE, openReceipt, readConsent } from "../lib/server/analyticsSecurity";
import { sendMetaLead } from "../lib/metaCapi";

export async function handoffMetaLead(receipt: string, consentVersion: string): Promise<{ sent: boolean }> {
  try {
    const consent = readConsent((await cookies()).get(CONSENT_COOKIE)?.value);
    if (!consent || consent.version !== consentVersion) return { sent: false };
    const accepted = openReceipt(receipt, consent);
    if (!accepted || !accepted.eventSourceUrl || !accepted.clientUserAgent) return { sent: false };
    return { sent: await sendMetaLead(accepted) };
  } catch { return { sent: false }; }
}
