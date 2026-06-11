import { createHash } from "node:crypto";

const sha256 = (value: string) =>
  createHash("sha256").update(value).digest("hex");

export async function sendMetaLead({
  email,
  phone,
  eventId,
}: {
  email: string;
  phone: string;
  eventId: string;
}) {
  const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;
  const accessToken = process.env.META_ACCESS_TOKEN;
  if (!pixelId || !accessToken) return;

  try {
    const res = await fetch(
      `https://graph.facebook.com/v21.0/${pixelId}/events`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          data: [
            {
              event_name: "Lead",
              event_time: Math.floor(Date.now() / 1000),
              event_id: eventId,
              action_source: "website",
              user_data: {
                em: [sha256(email.trim().toLowerCase())],
                ph: [sha256(`52${phone}`)],
              },
            },
          ],
          access_token: accessToken,
        }),
      },
    );
    if (!res.ok) {
      console.error("[metaCapi] CAPI responded", res.status, await res.text());
    }
  } catch (error) {
    console.error("[metaCapi] CAPI request failed:", error);
  }
}
