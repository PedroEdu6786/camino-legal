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
    title: "Contrato de prestación de servicios", unit: "Un contrato",
    lines: [["Diagnóstico · una persona o empresa", 39900], ["Redacción y versión final · un contrato", 210000]],
    plans: [[["Al inicio", 249900]], [["Al inicio · diagnóstico", 39900], ["Antes de la Etapa 2", 210000]]],
    stages: ["Diagnóstico · 3 días hábiles: formulario sobre tu operación, revisión de entregables, plazos y cobros, identificación de riesgos y mapa de cláusulas.", "Redacción y revisión · 10 días hábiles: contrato a medida con cláusulas de pago, entregables, confidencialidad, terminación y titularidad de lo creado. Incluye una ronda de ajustes.", "Versión final · incluida: documento listo para firmar, instrucciones de uso y firma, y formato editable para próximos clientes."],
    deliverables: ["Contrato a la medida de tu servicio.", "Reporte de diagnóstico de riesgos y cláusulas que los cubren.", "Guía de uso y firma."],
    notes: ["Esta cotización corresponde a un contrato de prestación de servicios. Otros acuerdos y revisiones se cotizan según su alcance.", "Anexos por separado: convenio de confidencialidad $799.00 MXN; aviso de privacidad $799.00 MXN; términos y condiciones $699.00 MXN.", "Los cambios de fondo posteriores a la ronda de ajustes se cotizan aparte."],
    firstStep: "Empieza con el diagnóstico por $399 MXN, incluidos en el total. Después decides si continúas.",
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
