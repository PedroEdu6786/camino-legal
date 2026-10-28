import { serviceDetails } from "./services.ts";

// Amounts in centavos, transcribed from Camino Legal's 2026 quotations.
export const serviceQuotes = {
  "registro-de-aviso-comercial": {
    title: "Registro de aviso comercial", unit: "Un aviso · una clase",
    lines: [["Estudio legal de viabilidad · un aviso", 79900], ["Honorarios de gestión · por clase", 228623], ["Tarifa oficial IMPI · por clase", 281377]],
    plans: [
      [["Al inicio", 589900]],
      [["Al inicio", 308523], ["Antes de presentar", 281377]],
      [["Al inicio", 79900], ["Antes de presentar", 281377], ["Al entregar el acuse", 228623]],
    ],
    stages: ["Estudio legal de viabilidad · 3 días hábiles: distintividad, disponibilidad de la frase, búsqueda de conflictos y definición de clase y vía de protección.", "Preparación de la solicitud · 6 días hábiles: asesoría, validación de documentos, presentación ante el IMPI y pago de la tarifa oficial.", "Seguimiento y gestión · 5 meses aproximadamente: publicación, oposiciones, notificaciones, requerimientos e informes hasta la resolución."],
    deliverables: ["Título de registro, si el IMPI lo concede; vigencia de 10 años desde el otorgamiento, renovable.", "Manual de uso de tu aviso y recordatorios de declaración de uso (año 3) y renovación (año 10).", "Un segundo estudio legal de viabilidad incluido."],
    notes: ["Cada clase adicional: $5,100.00 MXN de honorarios de gestión y tarifa IMPI. Te ayudamos a definir cuántas necesitas.", "Reglas de Uso: $616.00 MXN adicionales cuando el aviso tiene más de un titular.", "No incluye cargos por requerimientos, multas o recargos del IMPI; se revisan según el caso."],
    firstStep: "Empieza con el estudio por $799 MXN, incluidos en el total. Después decides si continúas.",
  },
  "derechos-de-autor": {
    title: "Registro de obra", unit: "Una obra",
    lines: [["Honorarios · Etapa 1", 29900], ["Búsqueda de antecedentes · íntegra al Instituto", 26100], ["Honorarios · Etapas 2 y 3", 167200], ["Derecho de registro INDAUTOR · íntegro al Instituto", 36700]],
    plans: [[["Al inicio", 259900]], [["Al inicio · Etapa 1", 56000], ["Antes de presentar", 203900]]],
    stages: ["Búsqueda de antecedentes · 3 días hábiles: revisión de la obra y su rama, búsqueda de títulos y obras en INDAUTOR y recomendaciones antes de presentar.", "Preparación y presentación · 5 días hábiles: integración del ejemplar y datos de autoría, formatos oficiales, presentación y pago del derecho de registro.", "Seguimiento y entrega · 15 días hábiles: atención a prevenciones, informes del trámite y entrega del certificado."],
    deliverables: ["Certificado de registro emitido por INDAUTOR a nombre del autor o titular.", "Resultado de la búsqueda antes de presentar."],
    notes: ["Cada obra adicional lleva su propia búsqueda, derecho y certificado; se cotiza aparte.", "No incluye requisitos o trámites extra que INDAUTOR pueda pedir mediante prevenciones; se revisan según el caso.", "El registro de marca se cotiza aparte si usarás el título como nombre comercial.", "Si pagas todo al inicio y decides no continuar tras la búsqueda, se devuelven $2,039.00 MXN. La Etapa 1 no es reembolsable."],
    firstStep: "Empieza con la búsqueda por $560 MXN, incluidos en el total. Después decides si continúas.",
  },
  "contratos-y-convenios": {
    title: "Redacción de un contrato", unit: "Un contrato",
    lines: [["Diagnóstico y asesoría legal · una persona o empresa", 39900], ["Redacción y versión final · un contrato", 210000]],
    plans: [[["Al inicio", 249900]], [["Al inicio · diagnóstico", 39900], ["Antes de la redacción", 210000]]],
    stages: ["Diagnóstico y asesoría legal · 3 días hábiles: llenas un formulario sobre tu situación y agenda una asesoría para identificar qué necesitas realmente y definir el alcance del servicio.", "Redacción del contrato · 10 días hábiles: con base en el diagnóstico y una vez realizado el pago correspondiente, elaboramos el contrato que mejor se adapte a tus necesidades.", "Revisión y ajustes · incluida: revisas el documento y hacemos los ajustes necesarios dentro del alcance acordado, hasta llegar a la versión final lista para firmar."],
    deliverables: ["Contrato redactado a la medida de tus necesidades.", "Reporte de diagnóstico de riesgos y cláusulas que los cubren.", "Documento final listo para firmar, con guía de uso."],
    notes: ["Trabajamos con distintos tipos de contratos y convenios, como prestación de servicios, confidencialidad (NDA) y acuerdos comerciales. Esta cotización corresponde a la redacción de un contrato; las revisiones de documentos existentes y otros tipos de acuerdo se cotizan según su alcance.", "Según tu caso, pueden requerirse documentos complementarios como aviso de privacidad, términos y condiciones o cláusulas sobre cookies; se cotizan por separado, por ejemplo, un aviso de privacidad o un convenio de confidencialidad desde $799.00 MXN.", "Los cambios de fondo posteriores a la ronda de ajustes se cotizan aparte."],
    firstStep: "Empieza con el diagnóstico y la asesoría por $399 MXN, incluidos en el total. Después decides si continúas con la redacción.",
  },
} as const;

export function getServiceQuote(slug: string) {
  return serviceQuotes[slug as keyof typeof serviceQuotes];
}

export const quoteServices = serviceDetails;

export function serviceQuoteTotal(slug: string) {
  return getServiceQuote(slug)?.lines.reduce((sum, [, amount]) => sum + amount, 0);
}

export function servicePaymentPlan(slug: string, count: number) {
  const quote = getServiceQuote(slug);
  return quote?.plans.find(plan => plan.length === count) ?? quote?.plans[quote.plans.length - 1];
}
