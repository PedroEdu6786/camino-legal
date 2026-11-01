import { normalizePhone } from "./phone.ts";

export const FORM_IDS = ["contact", "trademark_evaluation", "quotation_consultation"] as const;
export type FormId = (typeof FORM_IDS)[number];

export function consultationMessage(service: string, detail: string) {
  return `¡Hola, equipo de Camino Legal!\n\nMe gustaría recibir información sobre ${service.toLocaleLowerCase("es-MX")}. ${detail}\n\n¿Me ayudan a confirmar qué incluye el servicio y cómo podemos empezar? ¡Gracias!`;
}

export const evaluationMessage = "¡Hola, equipo de Camino Legal!\n\nMe gustaría saber si puedo registrar mi marca. Por ahora quiero empezar solo con la evaluación de viabilidad de $799 MXN, con IVA incluido.\n\n¿Me cuentan cómo funciona y qué información necesitan de mi marca? ¡Gracias!";

export function contactRequest(data: FormData) {
  const value = (key: string) => typeof data.get(key) === "string" ? String(data.get(key)).trim() : "";
  const submittedId = value("formId");
  const formId: FormId = FORM_IDS.includes(submittedId as FormId) ? submittedId as FormId
    : value("formKind") === "evaluation" ? "trademark_evaluation" : "contact";
  return { name: value("name"), phone: normalizePhone(value("phone"), value("phoneCountry") || "MX"), email: value("email"), message: value("message"), formId };
}

export function validContactRequest(request: ReturnType<typeof contactRequest>) {
  const { name, phone, email, message } = request;
  return Boolean(name && name.length <= 150 && /^\+[1-9]\d{6,14}$/.test(phone)
    && email && email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    && message && message.length <= 5000);
}
