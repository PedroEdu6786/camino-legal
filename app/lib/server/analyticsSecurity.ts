// Server-only: Node crypto; never import this module into client components.
import { createCipheriv, createDecipheriv, createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";

import { FORM_IDS, type FormId } from "../contactRequest.ts";

export const CONSENT_COOKIE = "camino-analytics-consent";
export type ConsentEvidence = { status: "granted" | "denied"; version: string };
export type AcceptedReceipt = {
  outcomeEventId: string;
  occurredAt: number;
  expiresAt: number;
  consentVersion: string;
  formId: FormId;
  emailHash: string;
  phoneHash?: string;
  eventSourceUrl?: string;
  clientUserAgent?: string;
};
const VERSION = /^[a-zA-Z0-9_-]{1,100}$/;
export function isConsentVersion(value: unknown): value is string {
  return typeof value === "string" && VERSION.test(value);
}
function key(secret = process.env.ANALYTICS_SERVER_SECRET) {
  return secret && Buffer.byteLength(secret) >= 32 ? createHash("sha256").update(secret).digest() : null;
}
export function signConsent(evidence: ConsentEvidence, secret?: string): string | null {
  const signingKey = key(secret);
  if (!signingKey || !isConsentVersion(evidence.version) || !["granted", "denied"].includes(evidence.status)) return null;
  const payload = Buffer.from(JSON.stringify(evidence)).toString("base64url");
  const signature = createHmac("sha256", signingKey).update(`consent:${payload}`).digest("base64url");
  return `${payload}.${signature}`;
}
export function readConsent(value: string | undefined, secret?: string): ConsentEvidence | null {
  const signingKey = key(secret);
  if (!signingKey || !value || value.length > 1024) return null;
  const [payload, signature, extra] = value.split(".");
  if (!payload || !signature || extra) return null;
  const expected = createHmac("sha256", signingKey).update(`consent:${payload}`).digest();
  const actual = Buffer.from(signature, "base64url");
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return null;
  try {
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString());
    return ["granted", "denied"].includes(parsed.status) && isConsentVersion(parsed.version)
      ? { status: parsed.status, version: parsed.version } : null;
  } catch { return null; }
}
export function matchingHashes(email: string, phone: string) {
  const hash = (value: string) => createHash("sha256").update(value).digest("hex");
  const digits = phone.replace(/\D/g, "");
  return { emailHash: hash(email.trim().toLowerCase()), ...(digits ? { phoneHash: hash(digits) } : {}) };
}
/** Never trust a request Host header or a user-supplied absolute URL. */
export function websiteSourceUrl(formId: AcceptedReceipt["formId"], submittedPath: string, configuredOrigin = process.env.META_WEBSITE_ORIGIN): string | null {
  if (!configuredOrigin || (formId !== "contact" ? submittedPath !== "" && submittedPath !== "/cotizaciones" : !["", "/", "/contacto"].includes(submittedPath))) return null;
  const path = formId !== "contact" ? "/cotizaciones" : submittedPath === "/" ? "/" : "/contacto";
  try {
    const origin = new URL(configuredOrigin);
    if (origin.protocol !== "https:" || origin.username || origin.password || origin.search || origin.hash || origin.pathname !== "/") return null;
    return `${origin.origin}${path}`;
  } catch { return null; }
}
export function safeUserAgent(value: string | null): string | undefined {
  return typeof value === "string" && value.length > 0 && value.length <= 512 && !/[\x00-\x1f\x7f]/.test(value) ? value : undefined;
}
export function createReceipt(receipt: AcceptedReceipt, secret?: string): string | null {
  const encryptionKey = key(secret);
  if (!encryptionKey) return null;
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", encryptionKey, iv);
  cipher.setAAD(Buffer.from("camino-accepted-lead:v1"));
  const encrypted = Buffer.concat([cipher.update(JSON.stringify(receipt), "utf8"), cipher.final()]);
  return ["v1", iv.toString("base64url"), encrypted.toString("base64url"), cipher.getAuthTag().toString("base64url")].join(".");
}
export function openReceipt(value: string, consent: ConsentEvidence | null, now = Date.now(), secret?: string): AcceptedReceipt | null {
  const encryptionKey = key(secret);
  if (!encryptionKey || !consent || consent.status !== "granted" || typeof value !== "string" || value.length > 4096) return null;
  try {
    const [version, iv, encrypted, tag, extra] = value.split(".");
    if (version !== "v1" || extra || !iv || !encrypted || !tag) return null;
    const decipher = createDecipheriv("aes-256-gcm", encryptionKey, Buffer.from(iv, "base64url"));
    decipher.setAAD(Buffer.from("camino-accepted-lead:v1"));
    decipher.setAuthTag(Buffer.from(tag, "base64url"));
    const parsed = JSON.parse(Buffer.concat([decipher.update(Buffer.from(encrypted, "base64url")), decipher.final()]).toString());
    if (!/^[a-f0-9-]{36}$/.test(parsed.outcomeEventId) || parsed.consentVersion !== consent.version ||
      !FORM_IDS.includes(parsed.formId) || !/^[a-f0-9]{64}$/.test(parsed.emailHash) ||
      (parsed.phoneHash !== undefined && !/^[a-f0-9]{64}$/.test(parsed.phoneHash)) ||
      (parsed.eventSourceUrl !== undefined && (typeof parsed.eventSourceUrl !== "string" || parsed.eventSourceUrl !== websiteSourceUrl(parsed.formId, new URL(parsed.eventSourceUrl).pathname))) ||
      (parsed.clientUserAgent !== undefined && safeUserAgent(parsed.clientUserAgent) !== parsed.clientUserAgent) ||
      !Number.isInteger(parsed.occurredAt) || !Number.isInteger(parsed.expiresAt) || parsed.occurredAt > now ||
      parsed.expiresAt <= now || parsed.expiresAt - parsed.occurredAt !== 300000) return null;
    return parsed as AcceptedReceipt;
  } catch { return null; }
}
