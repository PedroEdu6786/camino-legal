import { serviceDetails } from "./services.ts";

// Amounts in centavos, transcribed from Camino Legal's 2026 quotations.
export const serviceQuotes = {
  "marco-legal-digital": {
    title: "Paquete Legal Web", unit: "Un sitio web o app",
    lines: [["Aviso de privacidad integral", 130000], ["Términos y condiciones", 149900], ["Cláusula de confidencialidad para correos electrónicos", 0], ["Política de cookies", 0]],
    plans: [
      [["Al inicio", 279900]],
      [["Al inicio", 139900], ["Antes de la entrega final", 140000]],
      [["Al inicio · diagnóstico", 39900], ["Para iniciar la redacción", 120000], ["A la entrega final", 120000]],
    ],
    stages: [
      {
        title: "Diagnóstico",
        timing: "según disponibilidad",
        price: "$399 MXN al elegir tres pagos, incluidos en el total",
        description: "Revisamos cómo funciona tu negocio y tu sitio, qué datos personales recabas y para qué, qué ofreces en línea y cómo cobras."
      },
      {
        title: "Redacción y revisión",
        timing: "10 días hábiles a partir del diagnóstico y de recibir tu información completa",
        price: "",
        description: "Elaboramos los documentos con base en tu operación, te enviamos el borrador e incluimos una ronda de cambios."
      },
      {
        title: "Versión final y publicación",
        timing: "incluida",
        price: "",
        description: "Entregamos tus documentos en Word y PDF, con un formato adecuado a tu logo y diseño e indicaciones para publicarlos en tu página."
      }
    ],
    deliverables: ["Aviso de privacidad integral, adaptado a los datos que recabas y su uso.", "Términos y condiciones: reglas, derechos y licencia de uso de tu sitio o app.", "Cláusula de confidencialidad para la firma de tus correos electrónicos.", "Política de cookies: qué rastrea tu sitio y cómo se acepta.", "Documentos finales en Word y PDF, adaptados a tu logo y diseño, con indicaciones de publicación."],
    notes: ["Incluye una ronda de cambios sobre el borrador.", "Los 10 días hábiles de redacción y revisión corren a partir del diagnóstico y de recibir tu información completa.", "Convenio de confidencialidad para compartir información reservada con clientes, socios o colaboradores: $1,099.00 MXN adicionales, IVA incluido. Es distinto de la cláusula para correos electrónicos incluida en el paquete.", "Los cambios de fondo posteriores a la entrega final, si cambia tu negocio o tu sitio, se cotizan aparte."],
    firstStep: "Empieza con el diagnóstico por $399 MXN al elegir tres pagos; forma parte del total. También puedes elegir pago único o dos pagos.",
  },
  "registro-de-aviso-comercial": {
    title: "Registro de aviso comercial", unit: "Un aviso · una clase",
    lines: [["Estudio legal de viabilidad · un aviso", 79900], ["Honorarios de gestión · por clase", 228623], ["Tarifa oficial IMPI · por clase", 281377]],
    plans: [
      [["Al inicio", 589900]],
      [["Al inicio", 308523], ["Antes de presentar", 281377]],
      [["Al inicio", 79900], ["Antes de presentar", 281377], ["Al entregar el acuse", 228623]],
    ],
    stages: [
      {
        title: "Estudio legal de viabilidad",
        timing: "3 días hábiles",
        price: "$799 MXN, incluidos en el total",
        description: "Distintividad, disponibilidad de la frase, búsqueda de conflictos y definición de clase y vía de protección."
      },
      {
        title: "Preparación de la solicitud",
        timing: "6 días hábiles",
        price: "",
        description: "Asesoría, validación de documentos, presentación ante el IMPI y pago de la tarifa oficial."
      },
      {
        title: "Seguimiento y gestión",
        timing: "5 meses aproximadamente",
        price: "",
        description: "Publicación, oposiciones, notificaciones, requerimientos e informes hasta la resolución."
      }
    ],
    deliverables: ["Título de registro, si el IMPI lo concede; vigencia de 10 años desde el otorgamiento, renovable.", "Manual de uso de tu aviso y recordatorios de declaración de uso (año 3) y renovación (año 10).", "Un segundo estudio legal de viabilidad incluido."],
    notes: ["Cada clase adicional: $5,100.00 MXN de honorarios de gestión y tarifa IMPI. Te ayudamos a definir cuántas necesitas.", "Reglas de Uso: $616.00 MXN adicionales cuando el aviso tiene más de un titular.", "No incluye cargos por requerimientos, multas o recargos del IMPI; se revisan según el caso."],
    firstStep: "Empieza con el estudio por $799 MXN, incluidos en el total. Después decides si continúas.",
  },
  "derechos-de-autor": {
    title: "Registro de obra", unit: "Una obra",
    lines: [["Honorarios · Etapa 1", 29900], ["Búsqueda de antecedentes · íntegra al Instituto", 26100], ["Honorarios · Etapas 2 y 3", 167200], ["Derecho de registro INDAUTOR · íntegro al Instituto", 36700]],
    plans: [[["Al inicio", 259900]], [["Al inicio · Etapa 1", 56000], ["Antes de presentar", 203900]]],
    stages: [
      {
        title: "Búsqueda de antecedentes",
        timing: "3 días hábiles",
        price: "$560 MXN, incluidos en el total",
        description: "Revisión de la obra y su rama, búsqueda de títulos y obras en INDAUTOR y recomendaciones antes de presentar."
      },
      {
        title: "Preparación y presentación",
        timing: "5 días hábiles",
        price: "",
        description: "Integración del ejemplar y datos de autoría, formatos oficiales, presentación y pago del derecho de registro."
      },
      {
        title: "Seguimiento y entrega",
        timing: "15 días hábiles",
        price: "",
        description: "Atención a prevenciones, informes del trámite y entrega del certificado."
      }
    ],
    deliverables: ["Certificado de registro emitido por INDAUTOR a nombre del autor o titular.", "Resultado de la búsqueda antes de presentar."],
    notes: ["Cada obra adicional lleva su propia búsqueda, derecho y certificado; se cotiza aparte.", "No incluye requisitos o trámites extra que INDAUTOR pueda pedir mediante prevenciones; se revisan según el caso.", "El registro de marca se cotiza aparte si usarás el título como nombre comercial.", "Si pagas todo al inicio y decides no continuar tras la búsqueda, se devuelven $2,039.00 MXN. La Etapa 1 no es reembolsable."],
    firstStep: "Empieza con la búsqueda por $560 MXN, incluidos en el total. Después decides si continúas.",
  },
  "contratos-y-convenios": {
    title: "Redacción de un contrato", unit: "Un contrato",
    lines: [["Diagnóstico y asesoría legal · una persona o empresa", 39900], ["Redacción y versión final · un contrato", 210000]],
    plans: [[["Al inicio", 249900]], [["Al inicio · diagnóstico", 39900], ["Antes de la redacción", 210000]]],
    stages: [
      {
        title: "Diagnóstico y asesoría legal",
        timing: "3 días hábiles",
        price: "$399 MXN, incluidos en el total",
        description: "Llenas un formulario sobre tu situación y agenda una asesoría para identificar qué necesitas realmente y definir el alcance del servicio."
      },
      {
        title: "Redacción del contrato",
        timing: "10 días hábiles",
        price: "",
        description: "Con base en el diagnóstico y una vez realizado el pago correspondiente, elaboramos el contrato que mejor se adapte a tus necesidades."
      },
      {
        title: "Revisión y ajustes",
        timing: "incluida",
        price: "",
        description: "Revisas el documento y hacemos los ajustes necesarios dentro del alcance acordado, hasta llegar a la versión final lista para firmar."
      }
    ],
    deliverables: ["Contrato redactado a la medida de tus necesidades.", "Reporte de diagnóstico de riesgos y cláusulas que los cubren.", "Documento final listo para firmar, con guía de uso."],
    notes: ["Trabajamos con distintos tipos de contratos y convenios, como prestación de servicios, confidencialidad (NDA) y acuerdos comerciales. Esta cotización corresponde a la redacción de un contrato; las revisiones de documentos existentes y otros tipos de acuerdo se cotizan según su alcance.", "Según tu caso, pueden requerirse documentos complementarios como aviso de privacidad, términos y condiciones o cláusulas sobre cookies; se cotizan por separado, por ejemplo, un aviso de privacidad o un convenio de confidencialidad desde $799.00 MXN.", "Los cambios de fondo posteriores a la ronda de ajustes se cotizan aparte."],
    firstStep: "Empieza con el diagnóstico y la asesoría por $399 MXN, incluidos en el total. Después decides si continúas con la redacción.",
  },
  "consultoria-legal": {
    title: "Consultoría legal", unit: "Una consultoría",
    lines: [["Consultoría legal · reunión en línea y diagnóstico por escrito", 39900]],
    plans: [[["Al agendar", 39900]]],
    stages: [
      {
        title: "Reunión en línea",
        timing: "aprox. 45 minutos",
        price: "$399 MXN por la consultoría completa",
        description: "Revisamos tu idea o proyecto y los documentos que compartas, y te explicamos tus opciones de protección. Recibes el enlace por correo al agendar."
      },
      {
        title: "Diagnóstico por escrito",
        timing: "3 días hábiles",
        price: "incluido en los $399 MXN de la consultoría",
        description: "Riesgos identificados y la vía recomendada."
      },
      {
        title: "Cotización personalizada",
        timing: "",
        price: "",
        description: "Te compartimos el costo del servicio que necesitas."
      }
    ],
    deliverables: ["Diagnóstico por escrito con riesgos identificados y la vía recomendada.", "Cotización personalizada del servicio que necesitas."],
    notes: ["Abonable al costo total del servicio cotizado, si lo contratas dentro de los 30 días naturales siguientes a la entrega de tu diagnóstico."],
    firstStep: "Abonable al costo total del servicio cotizado, si lo contratas dentro de los 30 días naturales siguientes a la entrega de tu diagnóstico.",
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
