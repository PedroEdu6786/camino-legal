"use server";
import { cookies } from "next/headers";
import { CONSENT_COOKIE, isConsentVersion, signConsent } from "../lib/server/analyticsSecurity";

export async function updateAnalyticsConsent(status: "granted" | "denied", version: string): Promise<{ acknowledged: boolean }> {
  if (!["granted", "denied"].includes(status) || !isConsentVersion(version)) return { acknowledged: false };
  const value = signConsent({ status, version });
  if (!value) return { acknowledged: false };
  try {
    (await cookies()).set(CONSENT_COOKIE, value, {
      httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", path: "/",
    });
    return { acknowledged: true };
  } catch { return { acknowledged: false }; }
}
